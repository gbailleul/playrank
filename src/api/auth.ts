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

  register: (firstName: string, lastName: string, email: string, password: string) => {
    return client.post<{ user: User; token: string }>('/auth/register', {
      firstName,
      lastName,
      email,
      password
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    return client.post('/auth/logout');
  }
}; 