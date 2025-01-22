import type { Game, CreateGameDto, AddScoreData } from '../types/index';
import type { CricketGameStats } from '../types/variants/cricket/types';
import type { AddAroundTheClockScoreData, AroundTheClockScoreResponse } from '../types/variants/aroundTheClock/types';
import { dashboardService } from './dashboard';
import client from './client';
import { AddCricketScoreData, ClassicScoreResponse, CricketScoreResponse } from '../types/base/game';

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
    client.post<CricketScoreResponse>(`/api/games/cricket/${gameId}/sessions/${sessionId}/scores`, data),

  addAroundTheClockScore: (gameId: string, sessionId: string, data: AddAroundTheClockScoreData) => {
    return client.post<AroundTheClockScoreResponse>(`/api/games/around-the-clock/${gameId}/sessions/${sessionId}/score`, data);
  },

  endSession: (gameId: string, sessionId: string, winnerId: string, gameStats?: CricketGameStats) => {
    const baseEndpoint = gameStats 
      ? `/api/games/cricket/${gameId}/sessions/${sessionId}/end`
      : `/api/games/classic/${gameId}/sessions/${sessionId}/end`;
      
    return client.post(baseEndpoint, { 
      winnerId,
      ...(gameStats && { gameStats })
    });
  }
};

export { dashboardService }; 