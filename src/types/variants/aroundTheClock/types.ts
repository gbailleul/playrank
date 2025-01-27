import { GameStatus } from '../../game';

export interface AroundTheClockThrow {
  number: number;
  isHit: boolean;
  timestamp: number;
  playerId: string;
}

export interface AroundTheClockScore {
  id: string;
  playerGameId: string;
  currentNumber: number;
  throwHistory: string;  // JSON string of AroundTheClockThrow[]
  validatedNumbers: string;  // JSON string of number[]
  totalThrows: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddAroundTheClockScoreData {
  playerId: string;
  throws: AroundTheClockThrow[];
  currentNumber: number;
  validatedNumbers: number[];
}

export interface AroundTheClockPlayerState {
  id: string;
  username: string;
  currentNumber: number;
  throwHistory: AroundTheClockThrow[];
  validatedNumbers: number[];
  totalThrows: number;
  validatedCount: number;
}

export interface AroundTheClockGameState {
  variant: 'AROUND_THE_CLOCK';
  status: GameStatus;
  currentPlayerIndex: number;
  players: AroundTheClockPlayerState[];
  lastUpdateTimestamp: number;
  winner?: string;
}

export interface AroundTheClockStateUpdate {
  throwHistory: AroundTheClockThrow[];
  validatedNumbers: number[];
  currentNumber: number;
  totalThrows: number;
  validatedCount: number;
}

export interface AroundTheClockScoreResponse {
  data: {
    players: {
      id: string;
      username: string;
      currentNumber: number;
      throwHistory: AroundTheClockThrow[];
      validatedNumbers: number[];
      totalThrows: number;
      validatedCount: number;
    }[];
    currentPlayerIndex: number;
    status: GameStatus;
    variant: 'AROUND_THE_CLOCK';
    lastUpdateTimestamp: number;
    winner?: string;
  };
} 