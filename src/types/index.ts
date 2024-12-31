export type GameType = 'DARTS' | 'BILLIARDS';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'PLAYER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt: string;
  updatedAt: string;
}

export interface UserStatistics {
  gamesCreated: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
}

export interface UserActivity {
  type: 'game_created' | 'game_played';
  game: {
    id: string;
    name: string;
    gameType: GameType;
  };
  result?: {
    score: number;
    rank?: number;
    won: boolean;
  };
  timestamp: string;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  gameType: 'DARTS' | 'BILLIARDS';
  maxPlayers: number;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameDto {
  name: string;
  gameType: 'DARTS' | 'BILLIARDS';
  description?: string;
  maxScore: number;
  minPlayers: number;
  maxPlayers: number;
}

export interface GameSession {
  id: string;
  gameId: string;
  status: 'active' | 'completed' | 'cancelled';
  startedAt: string;
  endedAt: string | null;
  winnerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerGame {
  id: string;
  gameSessionId: string;
  playerId: string;
  currentScore: number;
  rank: number | null;
  joinedAt: string;
  updatedAt: string;
}

export interface Score {
  id: string;
  playerGameId: string;
  value: number;
  timestamp: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  surname: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
} 