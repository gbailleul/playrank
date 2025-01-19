import { GameType, DartVariant, GameStatus } from '../game';
import type { PlayerGame } from '../index';

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

export interface GameSession {
  id: string;
  gameId: string;
  game: Game;
  players: PlayerGame[];
  status: GameStatus;
  winnerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Score {
  id: string;
  points: number;
  turnNumber: number;
  isDouble: boolean;
  createdAt: Date;
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
} 