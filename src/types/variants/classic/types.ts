import { GameStatus } from '../../game';
import { Score } from '../../base/game';

export interface ClassicPlayerState {
  id: string;
  username: string;
  scores: Score[];
  currentScore: number;
}

export interface ClassicGameState {
  players: ClassicPlayerState[];
  currentPlayerIndex: number;
  gameStatus: GameStatus;
  winner?: string;
}

export interface ClassicGameStats {
  variant: 'X01';
  duration: number;
  startingScore: number;
  winner: {
    id: string;
    totalPoints: number;
    averagePoints: number;
    totalDoubles: number;
    totalTriples: number;
  };
  players: Array<{
    id: string;
    totalPoints: number;
    averagePoints: number;
    totalDoubles: number;
    totalTriples: number;
  }>;
} 