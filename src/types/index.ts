import type { GameType, DartVariant, GameStatus, DashboardGame, UserStatistics, PlayerGame } from './game';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'PLAYER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt: Date;
  updatedAt: Date;
  statistics?: UserStatistics;
  playerGames?: PlayerGame[];
  recentActivity?: UserActivity[];
}

export interface DashboardResponse {
  games: DashboardGame[];
  globalStats: {
    averageAccuracy: number;
    averagePointsPerDart: number;
    averageGamesPerPlayer: number;
    totalDartsThrown: number;
    totalDoubles: number;
    totalTriples: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  topPlayers: {
    id: string;
    username: string;
    avatarUrl?: string;
    statistics: UserStatistics;
  }[];
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatarUrl?: string;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  accuracy: number;
  averagePointsPerDart: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  userRank?: LeaderboardEntry;
}

export interface UserActivity {
  id: string;
  type: 'GAME_PLAYED' | 'ACHIEVEMENT_UNLOCKED' | 'RANK_CHANGED';
  description: string;
  timestamp: Date;
}

export interface AddScoreData {
  playerId: string;
  points: number;
  turnNumber: number;
  isDouble?: boolean;
}

// Re-export les enums depuis game.ts
export { GameType, DartVariant } from './game';
export type { GameStatus } from './game';

// Re-export les autres types liés aux jeux
export type { 
  Game,
  GameSession,
  Player,
  PlayerGame,
  Score,
  CreateGameDto,
  DashboardGame,
  UserStatistics
} from './game';