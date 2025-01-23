import { GameStatus } from '../game';

export interface Score {
  id: string;
  playerGameId: string;
  points: number;
  turnNumber: number;
  createdAt: string;
  notes: string | null;
  isDouble: boolean;
  isTriple: boolean;
}

export interface PlayerScore {
  id: string;
  username: string;
  scores: Score[];
  currentScore: number;
}

export interface GameScoreResponse {
  players: PlayerScore[];
  currentPlayerIndex: number;
  gameStatus: GameStatus;
  winner?: string;
} 