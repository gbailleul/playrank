import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('API Base URL:', BASE_URL);

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configuration des retries
client.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Making request to:', config.url);
  console.log('Request headers:', config.headers);
  // Ajouter la configuration des retries
  config.retries = 3;
  config.retryDelay = 1000;
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor for error handling and retries
client.interceptors.response.use(
  (response) => {
    console.log('Response received from:', response.config.url);
    console.log('Response status:', response.status);
    return response;
  },
  async (error) => {
    const { config, response } = error;
    
    console.error('API Error details:', {
      url: config?.url,
      method: config?.method,
      status: response?.status,
      data: response?.data,
      error: error.message
    });
    
    // Si pas de config ou plus de retries disponibles
    if (!config || config.retries === 0) {
      if (!response) {
        console.error('Network error - server might be down:', error.message);
        return Promise.reject(error);
      }

      const { status, data } = response;
      
      // Gérer les erreurs d'authentification
      if (status === 401) {
        console.log('Authentication error - token might be invalid');
        // Ne pas rediriger ou supprimer le token si on est sur la page de login
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          const returnPath = window.location.pathname + window.location.search;
          window.location.href = `/login?returnTo=${encodeURIComponent(returnPath)}`;
        }
      }

      // Construire un objet d'erreur enrichi avec les données du backend
      const enhancedError = {
        ...error,
        response: {
          ...error.response,
          data: {
            message: data.message || 'Une erreur est survenue',
            code: data.code
          }
        }
      };
      
      return Promise.reject(enhancedError);
    }
    
    // Si on a encore des retries disponibles
    config.retries -= 1;
    console.log(`Retrying request to ${config.url} (${config.retries} attempts remaining)`);
    
    // Ne pas réessayer les erreurs 401 sur la page de login
    if (error.response?.status === 401 && window.location.pathname.includes('/login')) {
      return Promise.reject(error);
    }
    
    // Attendre avant de réessayer
    await new Promise(resolve => setTimeout(resolve, config.retryDelay));
    
    // Réessayer la requête
    return client(config);
  }
);

export default client; 