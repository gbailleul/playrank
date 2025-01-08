import { GameType, DartVariant, GameStatus } from './game';
import { PlayerCricketScores } from './cricket';

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
  playerGames?: PlayerGame[];
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
  sessions?: GameSession[];
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

export interface CricketScore {
  id: string;
  scores: PlayerCricketScores;
  createdAt: Date;
}

export interface Player {
  id: string;
  username: string;
}

export interface PlayerGame {
  id: string;
  playerId: string;
  gameSessionId: string;
  gameSession: GameSession;
  player: User;
  scores: Score[];
  cricketScores?: {
    scores: PlayerCricketScores;
  };
  currentScore: number;
  joinedAt: Date;
}

export interface GameSession {
  id: string;
  gameId: string;
  game: Game;
  players: PlayerGame[];
  status: 'IN_PROGRESS' | 'COMPLETED';
  winnerId?: string;
  createdAt: Date;
  updatedAt: Date;
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
export type { DashboardResponse } from './game';