import { GameStatus } from './game';

export interface AroundTheClockThrow {
  number: number;
  isHit: boolean;
  timestamp: number;
  playerId: string;
}

export interface AroundTheClockPlayerState {
  id: string;
  username: string;
  currentNumber: number;
  throwHistory: AroundTheClockThrow[];
  validatedNumbers: Set<number>;
  totalThrows: number;
  validatedCount: number;
}

export interface AroundTheClockGameState {
  variant: 'AROUND_THE_CLOCK';
  status: GameStatus;
  currentPlayerIndex: number;
  players: AroundTheClockPlayerState[];
  lastUpdateTimestamp: number;
}

export interface AroundTheClockScore {
  id: string;
  playerGameId: string;
  currentNumber: number;
  throwHistory: string;
  validatedNumbers: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddAroundTheClockScoreData {
  playerId: string;
  throws: AroundTheClockThrow[];
  currentNumber: number;
  validatedNumbers: number[];
} 