import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('API Base URL:', BASE_URL); // Log l'URL de base

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
    console.log('Token found and added to request headers'); // Log la présence du token
  } else {
    console.log('No token found in localStorage'); // Log l'absence de token
  }
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
    return response;
  },
  async (error) => {
    const { config, response } = error;
    
    // Log détaillé de l'erreur
    console.error('API Error details:', {
      url: config?.url,
      method: config?.method,
      status: response?.status,
      data: response?.data,
      headers: config?.headers, // Log les headers
      error: error.message
    });
    
    if (!config || config.retries === 0) {
      if (!response) {
        console.error('Network error - server might be down:', error.message);
        return Promise.reject(error);
      }

      const { status, data } = response;
      
      // Gérer les erreurs d'authentification
      if (status === 401) {
        console.log('Authentication error detected'); // Log l'erreur d'auth
        // Ne pas rediriger ou supprimer le token si on est sur la page de login
        if (!window.location.pathname.includes('/login')) {
          console.log('Not on login page, clearing token and redirecting'); // Log la redirection
          localStorage.removeItem('token');
          const returnPath = window.location.pathname + window.location.search;
          window.location.href = `/login?returnTo=${encodeURIComponent(returnPath)}`;
        }
      }

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
    console.log(`Retrying request. Attempts remaining: ${config.retries}`); // Log les tentatives restantes
    
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