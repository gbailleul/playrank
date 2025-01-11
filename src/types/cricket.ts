export type CricketTarget = 15 | 16 | 17 | 18 | 19 | 20 | 25;

export interface PlayerCricketScores {
  [key: string]: {
    hits: number;
    points: number;
  };
}

export interface CricketThrow {
  target: CricketTarget;
  multiplier: 1 | 2 | 3;
}

export interface CricketScoreData {
  playerId: string;
  throws: CricketThrow[];
  turnNumber: number;
}

export interface CricketScore {
  id: string;
  scores: PlayerCricketScores;
  createdAt: Date;
}

export interface CricketGameStats {
  totalPoints: number;
  totalHits: number;
  closedTargets: number;
  accuracy: number;
  averagePointsPerDart: number;
  highestScore: number;
  totalTriples: number;
  totalDoubles: number;
  totalBulls: number;
  totalDoubleBulls: number;
} 