import { GameType, DartVariant, GameStatus } from './game';
import { PlayerCricketScores } from './cricket';

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
  target: number;
  multiplier: number;
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
  scores: Score[];
  cricketScores?: CricketScore;
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

export { GameType, DartVariant, GameStatus };
export * from './cricket';
export type { DashboardResponse } from './game';