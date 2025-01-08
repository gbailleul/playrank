import { User } from '../types/index';
import client from './client';

export const auth = {
  getAllPlayers: () => {
    return client.get<User[]>('/users/players');
  },

  getProfile: () => {
    return client.get<User>('/auth/profile');
  },

  login: (email: string, password: string) => {
    return client.post<{ user: User; token: string }>('/auth/login', { email, password });
  },

  register: (username: string, firstName: string, lastName: string, email: string, password: string) => {
    return client.post<{ user: User; token: string }>('/auth/register', {
      username,
      firstName,
      lastName,
      email,
      password
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    return client.post('/auth/logout');
  },

  updateAvatar: (avatarData: string | File) => {
    const formData = new FormData();
    formData.append('avatar', avatarData);
    return client.post<{ avatarUrl: string }>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
}; 