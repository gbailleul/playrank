export enum GameType {
  DARTS = 'DARTS',
  BILLIARDS = 'BILLIARDS'
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

export interface DashboardResponse {
  games: DashboardGame[];
  globalStats: {
    averageAccuracy: number;
    averagePointsPerDart: number;
    averageGamesPerPlayer: number;
    totalDartsThrown: number;
    totalDoubles: number;
    totalTriples: number;
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