import { CricketGameState, CricketTarget } from '../../types/cricket';
import { GameStatus } from '../../types/game';

export const mockCricketGameState: CricketGameState = {
  players: [
    {
      id: '1',
      username: 'Player 1',
      scores: {
        '15': { hits: 0, points: 0 },
        '16': { hits: 0, points: 0 },
        '17': { hits: 0, points: 0 },
        '18': { hits: 0, points: 0 },
        '19': { hits: 0, points: 0 },
        '20': { hits: 0, points: 0 },
        '25': { hits: 0, points: 0 }
      },
      totalPoints: 0
    },
    {
      id: '2',
      username: 'Player 2',
      scores: {
        '15': { hits: 0, points: 0 },
        '16': { hits: 0, points: 0 },
        '17': { hits: 0, points: 0 },
        '18': { hits: 0, points: 0 },
        '19': { hits: 0, points: 0 },
        '20': { hits: 0, points: 0 },
        '25': { hits: 0, points: 0 }
      },
      totalPoints: 0
    }
  ],
  currentPlayerIndex: 0,
  gameStatus: GameStatus.IN_PROGRESS
};

export const mockCricketTargets: CricketTarget[] = [15, 16, 17, 18, 19, 20, 25]; 