import axios from '../axios';
import type { Game, GameSession } from '../../types/game';
import type { CreateGameDto } from '../../types/game';

export const gameService = {
  createGame: (data: CreateGameDto) => {
    return axios.post<Game>('/games', data);
  },

  getAllGames: () => {
    return axios.get<Game[]>('/games');
  },

  getGame: (id: string) => {
    return axios.get<Game>(`/games/${id}`);
  },

  getSession: (id: string) => {
    return axios.get<GameSession>(`/games/sessions/${id}`);
  },

  joinSession: (sessionId: string) => {
    return axios.post<GameSession>(`/games/sessions/${sessionId}/join`);
  },

  updateScore: (sessionId: string, playerId: string, score: number) => {
    return axios.put<GameSession>(`/games/sessions/${sessionId}/score`, {
      playerId,
      score,
    });
  },

  endGame: (sessionId: string, winnerId: string) => {
    return axios.put<GameSession>(`/games/sessions/${sessionId}/end`, {
      winnerId,
    });
  },
};

export default gameService;