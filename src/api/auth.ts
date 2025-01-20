import { User } from '../types/index';
import client from './client';

export const auth = {
  getAllPlayers: () => {
    return client.get<User[]>('/api/users/players');
  },

  getProfile: () => {
    return client.get<User>('/api/auth/profile');
  },

  login: (email: string, password: string) => {
    return client.post<{ user: User; token: string }>('/api/auth/login', { email, password });
  },

  register: (username: string, firstName: string, lastName: string, email: string, password: string) => {
    return client.post<{ user: User; token: string }>('/api/auth/register', {
      username,
      firstName,
      lastName,
      email,
      password
    });
  },

  forgotPassword: (email: string) => {
    return client.post('/api/auth/forgot-password', { email });
  },

  resetPassword: (token: string, password: string) => {
    return client.post('/api/auth/reset-password', { token, password });
  },

  logout: async () => {
    try {
      await client.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },

  updateAvatar: (avatarData: string | File) => {
    const formData = new FormData();
    formData.append('avatar', avatarData);
    return client.post<{ avatarUrl: string }>('/api/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
}; 