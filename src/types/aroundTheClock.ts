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
  validatedCount: number;
}

export interface AroundTheClockGameState {
  variant: 'AROUND_THE_CLOCK';
  status: string;
  currentPlayerIndex: number;
  players: Array<{
    id: string;
    username: string;
    currentNumber: number;
    throwHistory: AroundTheClockThrow[];
    totalThrows: number;
    validatedCount: number;
  }>;
  winner?: string;
}

export interface AroundTheClockScore {
  id: string;
  playerGameId: string;
  currentNumber: number;
  throwHistory: {
    set: AroundTheClockThrow[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface AddAroundTheClockScoreData {
  playerId: string;
  throws: AroundTheClockThrow[];
} 