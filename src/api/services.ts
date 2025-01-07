import type { Game, CreateGameDto, AddScoreData, CricketScoreData } from '../types';
import { dashboardService } from './dashboard';
import client from './client';

export const gameService = {
  createGame: (data: CreateGameDto) => {
    return client.post<Game>('/games', data);
  },

  getAllGames: () => {
    return client.get<Game[]>('/games');
  },

  getGame: (id: string) => {
    return client.get<Game>(`/games/${id}`);
  },

  getSession: (id: string) => {
    return client.get<Game>(`/games/${id}`);
  },

  createGameSession: (gameId: string, data: { players: string[] }) => {
    return client.post<Game>(`/games/${gameId}/sessions`, data);
  },

  addScore: (gameId: string, sessionId: string, data: AddScoreData) => {
    return client.post(`/games/${gameId}/sessions/${sessionId}/scores`, data);
  },

  addCricketScore: (gameId: string, sessionId: string, data: CricketScoreData) => {
    return client.post(`/games/${gameId}/sessions/${sessionId}/cricket-scores`, data);
  },

  endSession: (gameId: string, sessionId: string, winnerId: string) => {
    return client.post(`/games/${gameId}/sessions/${sessionId}/end`, { winnerId });
  }
};

export { dashboardService }; 