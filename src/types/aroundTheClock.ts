import { GameStatus } from './game';

export interface AroundTheClockThrow {
  number: number;
  isHit: boolean;
  timestamp: number;
}

export interface AroundTheClockPlayerState {
  id: string;
  username: string;
  currentNumber: number;
  throwHistory: AroundTheClockThrow[];
  totalThrows: number;
}

export interface AroundTheClockGameState {
  variant: 'AROUND_THE_CLOCK';
  status: GameStatus;
  currentPlayerIndex: number;
  players: AroundTheClockPlayerState[];
  winner?: string;
}

export interface AroundTheClockScore {
  id: string;
  playerGameId: string;
  currentNumber: number;
  throwHistory: AroundTheClockThrow[];
  createdAt: string;
  updatedAt: string;
}

export interface AddAroundTheClockScoreData {
  playerId: string;
  number: number;
  isHit: boolean;
  timestamp: number;
} 