import { Score } from './game';
import { User } from '../user';
import { AroundTheClockScore } from '../variants/aroundTheClock/types';

export interface Player {
  id: string;
  username: string;
}

export interface PlayerGame {
  id: string;
  playerId: string;
  gameSessionId: string;
  user?: User;
  guestPlayer?: {
    id: string;
    name: string;
  };
  scores: Score[];
  currentScore: number;
  joinedAt: Date;
  aroundTheClockScore?: AroundTheClockScore;
}

export interface ExtendedPlayer {
  id: string;
  username: string;
  scores: Score[];
  currentScore: number;
} 