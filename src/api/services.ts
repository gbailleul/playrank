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

export const auth = {
  login: async (username: string, password: string) => {
    return client.post<LoginResponse>('/auth/login', { username, password });
  },

  register: async (username: string, surname: string, email: string, password: string) => {
    return client.post<RegisterResponse>('/auth/register', { username, surname, email, password });
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