import { GameStatus } from '../../game';

export type CricketTarget = 15 | 16 | 17 | 18 | 19 | 20 | 25;

export interface CricketScoreTarget {
  hits: number;
  points: number;
}

export interface CricketThrow {
  target: number;
  multiplier: number;
}

export interface CricketScore {
  id: string;
  scores: Record<string, CricketScoreTarget>;
  createdAt: Date;
}

export interface CricketScoreData {
  playerId: string;
  throws: CricketThrow[];
  turnNumber: number;
}

export interface CricketPlayerState {
  id: string;
  username: string;
  scores: Record<string, CricketScoreTarget>;
  totalPoints: number;
}

export interface CricketGameState {
  players: CricketPlayerState[];
  currentPlayerIndex: number;
  gameStatus: GameStatus;
  winner?: string;
}

export interface CricketGameStats {
  variant: 'CRICKET';
  duration: number;
  winner: {
    id: string;
    closedTargets: number;
    totalPoints: number;
    totalHits: number;
  };
  players: Array<{
    id: string;
    closedTargets: number;
    totalPoints: number;
    totalHits: number;
  }>;
}

export interface CricketScoreResponse {
  cricketScore: {
    scores: Record<string, CricketScoreTarget>;
  };
} 