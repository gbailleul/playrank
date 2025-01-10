import axios, { InternalAxiosRequestConfig } from 'axios';

// Étendre la configuration Axios pour inclure les retries
interface RetryConfig extends InternalAxiosRequestConfig {
  retries?: number;
  retryDelay?: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000, // Augmenter le timeout à 30 secondes
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configuration des retries
client.interceptors.request.use((config: RetryConfig) => {
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
    if (!config || !config.retries) {
      console.error('API Error:', error);
      
      if (!response) {
        console.error('Network error:', error.message);
        return Promise.reject(error);
      }

      const { status, data } = response;
      
      // Gérer les erreurs d'authentification
      if (status === 401) {
        console.log('Authentication error:', data);
        // Supprimer le token
        localStorage.removeItem('token');
        
        // Si ce n'est pas déjà la page de login
        if (!window.location.pathname.includes('/login')) {
          // Sauvegarder la page actuelle
          const returnPath = window.location.pathname + window.location.search;
          // Rediriger vers la page de login
          window.location.href = `/login?returnTo=${encodeURIComponent(returnPath)}`;
        }
        
        return Promise.reject(error);
      }
      
      // Autres erreurs HTTP
      switch (status) {
        case 403:
          console.error('Forbidden access:', data);
          break;
        case 404:
          console.error('Resource not found:', data);
          break;
        case 500:
          console.error('Server error:', data);
          break;
        default:
          console.error(`HTTP error ${status}:`, data);
      }
      
      return Promise.reject(error);
    }

    // Décrémenter le nombre de retries
    config.retries -= 1;
    
    // Attendre avant de réessayer
    await new Promise(resolve => setTimeout(resolve, config.retryDelay));
    
    // Réessayer la requête
    return client(config);
  }
);

export default client; 