import type { LeaderboardResponse } from '../../types';
import { api } from '../api';

export const leaderboardService = {
  getLeaderboard: async (gameType: string): Promise<LeaderboardResponse> => {
    const response = await api.get<LeaderboardResponse>(`/leaderboard/${gameType}`);
    return response.data;
  }
}; 