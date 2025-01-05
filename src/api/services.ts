import client from './client';
import type { User, CreateGameDto, Game, ScoreResponse, DashboardResponse, LeaderboardResponse, UserStatistics } from '../types/index';
import { GameType } from '../types/index';


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

interface AddScoreData {
  playerId: string;
  points: number;
  turnNumber: number;
}

const API_URL = 'http://localhost:3000/api';

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

  logout: () => {
    localStorage.removeItem('token');
    return client.post('/auth/logout');
  },

  updateAvatar: async (avatarData: string | File) => {
    const formData = new FormData();
    
    try {
      if (avatarData instanceof File) {
        console.log('Uploading File object:', avatarData);
        formData.append('avatar', avatarData);
      } else if (avatarData.startsWith('data:')) {
        console.log('Converting base64 to File');
        const response = await fetch(avatarData);
        const blob = await response.blob();
        const file = new File([blob], 'avatar.png', { type: 'image/png' });
        console.log('Created File from base64:', file);
        formData.append('avatar', file);
      } else {
        console.log('Converting URL to File:', avatarData);
        const response = await fetch(avatarData);
        const contentType = response.headers.get('content-type') || 'image/png';
        const blob = await response.blob();
        const file = new File([blob], 'avatar.png', { type: contentType });
        console.log('Created File from URL:', file);
        formData.append('avatar', file);
      }

      // Log FormData contents
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      return client.patch<User>('/users/avatar', formData, {
        headers: {
          // Ne pas définir Content-Type, il sera automatiquement défini avec le boundary correct
        },
      });
    } catch (error) {
      console.error('Error in updateAvatar:', error);
      throw error;
    }
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

  getActiveSession: async (gameId: string) => {
    const response = await client.get<Game>(`/games/${gameId}`);
    const game = response.data;
    const activeSession = game.sessions?.[game.sessions.length - 1];
    if (!activeSession) {
      throw new Error('No active session found');
    }
    return { data: activeSession };
  },

  getSession: async (gameId: string) => {
    return client.get<Game>(`/games/${gameId}`);
  },

  addScore: (gameId: string, sessionId: string, data: AddScoreData) =>
    client.post<ScoreResponse>(`/games/${gameId}/sessions/${sessionId}/scores`, data),

  endSession: async (gameId: string, sessionId: string, winnerId: string) => {
    return client.patch(`/games/${gameId}/sessions/${sessionId}`, {
      status: 'COMPLETED',
      winnerId
    });
  },
};

export const dashboardService = {
  getDashboard: (page: number = 1) => client.get<DashboardResponse>(`/dashboard?page=${page}`),
};

export const leaderboardService = {
  getLeaderboard: async (gameType: GameType) => {
    return client.get<LeaderboardResponse>(`/leaderboard/${gameType}`);
  }
};

export const statisticsService = {
  getUserStatistics: async (userId: string) => {
    return client.get<UserStatistics>(`/users/${userId}/statistics`);
  }
}; 