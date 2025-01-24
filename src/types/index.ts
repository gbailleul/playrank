import { GameType, DartVariant, GameStatus } from './game';
import type { DashboardGame } from './game';
import type { GameSession as BaseGameSession } from './base/game';
import type { PlayerGame as BasePlayerGame } from './base/player';
import type { CricketScore as BaseCricketScore } from './variants/cricket/types';

// Re-export base types
export type { BaseGameSession as GameSession };
export type { BasePlayerGame as PlayerGame };
export type { BaseCricketScore as CricketScore };

// Export other types
export interface UserStatistics {
  id: string;
  userId: string;
  gamesPlayed: number;
  gamesWon: number;
  totalDartsThrown: number;
  averageDartsPerGame: number;
  highestScore: number;
  totalDoubles: number;
  totalTriples: number;
  accuracy: number;
  averagePointsPerDart: number;
  createdAt: Date;
  updatedAt: Date;
}

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
  playerGames?: BasePlayerGame[];
  recentActivity?: UserActivity[];
}

export interface UserActivity {
  id: string;
  type: 'GAME_PLAYED' | 'ACHIEVEMENT_UNLOCKED' | 'RANK_CHANGED';
  description: string;
  timestamp: Date;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  gameType: GameType;
  maxScore: number;
  minPlayers: number;
  maxPlayers: number;
  creatorId: string;
  variant: DartVariant;
  createdAt: Date;
  updatedAt: Date;
  sessions?: BaseGameSession[];
}

export interface CreateGameDto {
  name: string;
  description: string;
  gameType: GameType;
  maxScore: number;
  minPlayers: number;
  maxPlayers: number;
  variant: DartVariant;
}

export interface AddScoreData {
  playerId: string;
  points: number;
  turnNumber: number;
  isDouble?: boolean;
  isTriple?: boolean;
  activePlayerIndex: number;
}

export interface CricketScoreData {
  playerId: string;
  throws: Array<{
    target: number;
    multiplier: number;
  }>;
  turnNumber: number;
}

export interface Score {
  id: string;
  points: number;
  turnNumber: number;
  isDouble: boolean;
  createdAt: Date;
}

export interface Player {
  id: string;
  username: string;
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

export { GameType, DartVariant, GameStatus };
export * from './cricket';