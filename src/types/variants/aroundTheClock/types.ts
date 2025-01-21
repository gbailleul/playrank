import { GameStatus } from '../../game';
import { BaseScoreData } from '../../base/game';

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
  throwHistory: AroundTheClockThrow[];
  validatedNumbers: number[];
  createdAt: string;
  updatedAt: string;
}

export interface AddAroundTheClockScoreData extends BaseScoreData {
  throws: AroundTheClockThrow[];
  turnNumber: number;
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

export interface AroundTheClockStateUpdate {
  throwHistory: AroundTheClockThrow[];
  validatedNumbers: Set<number>;
  currentNumber: number;
  totalThrows: number;
  validatedCount: number;
}

export interface AroundTheClockScoreResponse {
  data: {
    players: AroundTheClockPlayerState[];
    currentPlayerIndex: number;
    status: GameStatus;
    variant: 'AROUND_THE_CLOCK';
    lastUpdateTimestamp: number;
    winner?: string;
  };
} 