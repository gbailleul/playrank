import type { Game, CreateGameDto, AddScoreData, CricketScoreData } from '../types/index';
import type { CricketGameStats } from '../types/cricket';
import type { AddAroundTheClockScoreData, AroundTheClockScore } from '../types/aroundTheClock';
import { dashboardService } from './dashboard';
import client from './client';

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

  addScore: (gameId: string, sessionId: string, data: AddScoreData) => {
    return client.post(`/api/games/classic/${gameId}/sessions/${sessionId}/scores`, data);
  },

  addCricketScore: (gameId: string, sessionId: string, data: CricketScoreData) => {
    console.log('Sending cricket score data:', data);
    return client.post(`/api/games/cricket/${gameId}/sessions/${sessionId}/scores`, data);
  },

  addAroundTheClockScore: (gameId: string, sessionId: string, data: AddAroundTheClockScoreData) => {
    return client.post<AroundTheClockScore>(`/api/games/around-the-clock/${gameId}/sessions/${sessionId}/scores`, data);
  },

  endSession: (gameId: string, sessionId: string, winnerId: string, gameStats?: CricketGameStats) => {
    return client.post(`/api/games/${gameId}/sessions/${sessionId}/end`, { 
      winnerId,
      ...(gameStats && { gameStats })
    });
  }
};

export { dashboardService }; 