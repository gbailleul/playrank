import client from './client';
import type { User, CreateGameDto, Game } from '../types';

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface ErrorResponse {
  errors?: ValidationErrors;
  message?: string;
}

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const response = await client.post<LoginResponse>('/auth/login', { email, password });
      return response;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  register: async (username: string, surname: string, email: string, password: string) => {
    try {
      const response = await client.post<RegisterResponse>('/auth/register', { 
        username, 
        surname, 
        email, 
        password 
      });
      return response;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  getProfile: async () => {
    return client.get<User>('/auth/profile');
  },
};

export const gameService = {
  createGame: async (data: CreateGameDto) => {
    return client.post<Game>('/games', data);
  },

  getAllGames: async () => {
    return client.get<Game[]>('/games');
  },

  getGameById: async (id: string) => {
    return client.get<Game>(`/games/${id}`);
  },
}; 