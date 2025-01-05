import type { LeaderboardResponse } from '../../types/index';
import client from '../client';

export const leaderboardService = {
  getLeaderboard: async (gameType: string): Promise<LeaderboardResponse> => {
    const response = await client.get<LeaderboardResponse>(`/leaderboard/${gameType}`);
    return response.data;
  }
}; 