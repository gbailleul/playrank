import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && (
      error.response?.status === 401 || 
      error.response?.data?.code === 'USER_NOT_FOUND' ||
      error.response?.data?.code === 'TOKEN_EXPIRED'
    )) {
      // Si l'erreur est liée à l'authentification, supprimer le token
      localStorage.removeItem('token');
      
      // Rediriger vers la page de connexion si nécessaire
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client; 