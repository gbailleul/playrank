import type { Game, CreateGameDto, AddScoreData, GameSession } from '../types/index';
import type { CricketGameStats } from '../types/variants/cricket/types';
import type { AddAroundTheClockScoreData, AroundTheClockScoreResponse } from '../types/variants/aroundTheClock/types';
import { dashboardService } from './dashboard';
import client from './client';
import { AddCricketScoreData, ClassicScoreResponse, CricketScoreResponse } from '../types/base/game';

interface GamePlayer {
  id?: string;
  name?: string;
}

interface CreateGameResponse {
  game: {
    id: string;
    name: string;
    description: string;
    gameType: string;
    maxScore: number;
    minPlayers: number;
    maxPlayers: number;
    variant: string;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    gameId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export const gameService = {
  createGame: (data: CreateGameDto & { players: GamePlayer[] }) => {
    return client.post<CreateGameResponse>('/api/games', data);
  },

  getAllGames: () => {
    return client.get<Game[]>('/api/games');
  },

  getGame: (id: string) => {
    return client.get<Game>(`/api/games/${id}`);
  },

  getSession: (gameId: string, sessionId: string) => {
    return client.get<GameSession>(`/api/games/${gameId}/sessions/${sessionId}`);
  },

  createGameSession: (gameId: string, data: { players: GamePlayer[] }) => {
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