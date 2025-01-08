import type { LeaderboardResponse } from '../../types/index';
import { GameType, DartVariant } from '../../types/index';
import client from '../client';

export const leaderboardService = {
  getLeaderboard: async (variant: DartVariant): Promise<LeaderboardResponse> => {
    const gameType = GameType.DARTS;
    const response = await client.get<LeaderboardResponse>(`/leaderboard/${gameType}?variant=${variant}`);
    return response.data;
  }
}; 