import type { LeaderboardResponse } from '$lib/types';
import { api } from '../api';

export const leaderboardService = {
  getLeaderboard: async (gameType: string): Promise<LeaderboardResponse> => {
    const { data } = await api.get<LeaderboardResponse>(`/leaderboard/${gameType}`);
    return data;
  }
}; 