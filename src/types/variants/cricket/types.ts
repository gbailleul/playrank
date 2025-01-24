import { GameStatus } from '../../game';
import { Score } from '../../base/score';

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

export interface CricketPlayerResponse {
  id: string;
  username: string;
  scores: Score[] | Record<string, CricketScoreTarget>;
  totalPoints: number;
}

export const DEFAULT_CRICKET_SCORES: Record<string, CricketScoreTarget> = {
  "15": { hits: 0, points: 0 },
  "16": { hits: 0, points: 0 },
  "17": { hits: 0, points: 0 },
  "18": { hits: 0, points: 0 },
  "19": { hits: 0, points: 0 },
  "20": { hits: 0, points: 0 },
  "25": { hits: 0, points: 0 }
}; 