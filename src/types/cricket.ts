import { GameStatus } from './game';

export type CricketTarget = 15 | 16 | 17 | 18 | 19 | 20 | 25;

export interface CricketScore {
  hits: number;
  points: number;
}

export interface PlayerCricketScores {
  [key: string]: CricketScore;
}

export interface CricketThrow {
  target: number;
  multiplier: number;
}

export interface CricketScoreData {
  playerId: string;
  throws: CricketThrow[];
  turnNumber: number;
}

export interface CricketGameState {
  players: Array<{
    id: string;
    username: string;
    scores: PlayerCricketScores;
    totalPoints: number;
  }>;
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

export interface CricketPlayerStats {
  cricketGamesPlayed: number;
  cricketGamesWon: number;
  averageClosedTargets: number;
  averagePointsPerGame: number;
  bestScore: number;
  cricketAccuracy: number;
} 