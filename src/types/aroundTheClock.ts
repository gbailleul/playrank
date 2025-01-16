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
  status: GameStatus;
  currentPlayerIndex: number;
  players: AroundTheClockPlayerState[];
  winner?: string;
}

export interface AroundTheClockScore {
  currentNumber: number;
  throwHistory: AroundTheClockThrow[];
}

export interface AddAroundTheClockScoreData {
  playerId: string;
  number: number;
  isHit: boolean;
  timestamp: number;
} 