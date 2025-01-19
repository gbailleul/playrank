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

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'PLAYER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt: Date;
  updatedAt: Date;
  statistics?: UserStatistics;
}

export interface UserActivity {
  id: string;
  type: 'GAME_PLAYED' | 'ACHIEVEMENT_UNLOCKED' | 'RANK_CHANGED';
  description: string;
  timestamp: Date;
} 