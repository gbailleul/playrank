import { GameType, DartVariant, GameStatus } from '../game';
import type { PlayerGame } from '../index';
import { CricketThrow, PlayerCricketScores } from '../cricket';
import { AroundTheClockThrow } from '../aroundTheClock';

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

export interface BaseScoreData {
  playerId: string;
  activePlayerIndex: number;
  turnNumber: number;
}

export interface AddScoreData extends BaseScoreData {
  points: number;
}

export interface AddCricketScoreData extends BaseScoreData {
  throws: CricketThrow[];
}

export interface AddAroundTheClockScoreData extends BaseScoreData {
  throws: AroundTheClockThrow[];
}

export interface BaseScoreResponse {
  players: Array<{
    id: string;
    username: string;
  }>;
  currentPlayerIndex: number;
  gameStatus: GameStatus;
  winner?: string;
}

export interface ClassicScoreResponse extends BaseScoreResponse {
  players: Array<{
    id: string;
    username: string;
    scores: Score[];
    currentScore: number;
  }>;
}

export interface CricketScoreResponse extends BaseScoreResponse {
  players: Array<{
    id: string;
    username: string;
    scores: PlayerCricketScores;
    totalPoints: number;
  }>;
}

export interface AroundTheClockScoreResponse extends BaseScoreResponse {
  players: Array<{
    id: string;
    username: string;
    currentNumber: number;
    throwHistory: AroundTheClockThrow[];
    validatedNumbers: number[];
  }>;
} 