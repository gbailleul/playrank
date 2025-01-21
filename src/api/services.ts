import type { Game, CreateGameDto, AddScoreData, CricketScoreData } from '../types/index';
import type { CricketGameStats } from '../types/cricket';
import type { AddAroundTheClockScoreData, AroundTheClockScore } from '../types/aroundTheClock';
import { dashboardService } from './dashboard';
import client from './client';
import { AddCricketScoreData, ClassicScoreResponse, CricketScoreResponse, AroundTheClockScoreResponse } from '../types/base/game';

export const gameService = {
  createGame: (data: CreateGameDto) => {
    return client.post<Game>('/api/games', data);
  },

  getAllGames: () => {
    return client.get<Game[]>('/api/games');
  },

  getGame: (id: string) => {
    return client.get<Game>(`/api/games/${id}`);
  },

  getSession: (gameId: string, sessionId: string) => {
    return client.get<Game>(`/api/games/${gameId}/sessions/${sessionId}`);
  },

  createGameSession: (gameId: string, data: { players: string[] }) => {
    return client.post<Game>(`/api/games/${gameId}/sessions`, data);
  },

  addScore: (gameId: string, sessionId: string, data: AddScoreData) =>
    client.post<ClassicScoreResponse>(`/api/games/classic/${gameId}/sessions/${sessionId}`, data),

  addCricketScore: (gameId: string, sessionId: string, data: AddCricketScoreData) =>
    client.post<CricketScoreResponse>(`/api/games/cricket/${gameId}/sessions/${sessionId}`, data),

  addAroundTheClockScore: (gameId: string, sessionId: string, data: AddAroundTheClockScoreData) =>
    client.post<AroundTheClockScoreResponse>(`/api/games/around-the-clock/${gameId}/sessions/${sessionId}`, data),

  endSession: (gameId: string, sessionId: string, winnerId: string, gameStats?: CricketGameStats) => {
    return client.post(`/api/games/${gameId}/sessions/${sessionId}/end`, { 
      winnerId,
      ...(gameStats && { gameStats })
    });
  }
};

export { dashboardService }; 