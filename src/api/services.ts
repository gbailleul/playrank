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

  register: async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      const response = await client.post<RegisterResponse>('/auth/register', { 
        firstName, 
        lastName, 
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

  getAllPlayers: async () => {
    return client.get<User[]>('/users/players');
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

  createGameSession: async (gameId: string, players: string[]) => {
    return client.post<Game>(`/games/${gameId}/sessions`, { players });
  },
}; 