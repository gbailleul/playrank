import client from './client';
import type { User, CreateGameDto, Game, GameSession, AddScorePayload, Score } from '../types';

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
};

/**
 * Service de gestion des sessions de jeu.
 * Gère les opérations liées aux sessions de jeu en cours.
 */
export const gameSessionService = {
  /**
   * Récupère une session de jeu.
   * @param sessionId - ID de la session
   */
  getSession: async (sessionId: string) => {
    return client.get<GameSession>(`/games/sessions/${sessionId}`);
  },

  /**
   * Ajoute un score à une session.
   * @param sessionId - ID de la session
   * @param payload - Données du score
   */
  addScore: async (sessionId: string, payload: AddScorePayload) => {
    return client.post<Score>(`/games/sessions/${sessionId}/scores`, payload);
  },

  /**
   * Termine une session de jeu.
   * @param sessionId - ID de la session
   * @param winnerId - ID du gagnant
   */
  endSession: async (sessionId: string, winnerId: string) => {
    return client.patch(`/games/sessions/${sessionId}`, {
      status: 'COMPLETED',
      winnerId
    });
  }
}; 