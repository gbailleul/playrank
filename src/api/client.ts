import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
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
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // Si pas de config ou plus de retries disponibles
    if (!config || config.retries === 0) {
      console.error('API Error:', error);
      
      if (!response) {
        console.error('Network error:', error.message);
        return Promise.reject(error);
      }

      const { status, data } = response;
      
      // Gérer les erreurs d'authentification
      if (status === 401) {
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