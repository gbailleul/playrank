export enum GameType {
  DARTS = 'DARTS',
  BILLIARDS = 'BILLIARDS',
  FOOSBALL = 'FOOSBALL'
}

export enum GameStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum DartVariant {
  FIVE_HUNDRED_ONE = 'FIVE_HUNDRED_ONE',
  THREE_HUNDRED_ONE = 'THREE_HUNDRED_ONE',
  CRICKET = 'CRICKET',
  AROUND_THE_CLOCK = 'AROUND_THE_CLOCK'
}

export interface Game {
  id: string;
  name: string;
  description: string;
  gameType: GameType;
  maxScore: number;
  minPlayers: number;
  maxPlayers: number;
  creatorId: string;
  variant: DartVariant;
  createdAt: Date;
  updatedAt: Date;
  sessions?: GameSession[];
}

export interface CreateGameDto {
  name: string;
  description: string;
  gameType: GameType;
  maxScore: number;
  minPlayers: number;
  maxPlayers: number;
  variant: DartVariant;
}

export interface GameSession {
  id: string;
  gameId: string;
  game: Game;
  players: PlayerGame[];
  status: GameStatus;
  winnerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerGame {
  id: string;
  playerId: string;
  gameSessionId: string;
  gameSession: GameSession;
  player: Player;
  scores: Score[];
  currentScore: number;
  joinedAt: Date;
}

export interface Player {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface Score {
  id: string;
  points: number;
  turnNumber: number;
  isDouble: boolean;
  createdAt: Date;
}

export interface DashboardGame {
  id: string;
  name: string;
  gameType: GameType;
  variant?: DartVariant;
  status: GameStatus;
  startedAt?: Date;
  endedAt?: Date;
  players: {
    id: string;
    username: string;
    avatarUrl?: string;
    currentScore: number;
    statistics?: UserStatistics;
  }[];
  winner?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface UserStatistics {
  id: string;
  userId: string;
  gamesPlayed: number;
  gamesWon: number;
  totalDartsThrown: number;
  averageDartsPerGame: number;
  highestScore: number;
  totalDoubles: number;
  totalTriples: number;
  accuracy: number;
  averagePointsPerDart: number;
  createdAt: Date;
  updatedAt: Date;
} 