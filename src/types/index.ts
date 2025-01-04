export type GameType = 'DARTS' | 'BILLIARDS';
export type DartVariant = 'FIVE_HUNDRED_ONE' | 'THREE_HUNDRED_ONE' | 'CRICKET' | 'AROUND_THE_CLOCK';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'PLAYER' | 'VIEWER';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  statistics?: UserStatistics;
  recentActivity?: UserActivity[];
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
  gameType: GameType;
  maxScore: number;
  minPlayers: number;
  maxPlayers: number;
  creatorId: string;
  variant?: DartVariant;
  sessions?: GameSession[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameDto {
  name: string;
  gameType: GameType;
  description?: string;
  maxScore: number;
  minPlayers: number;
  maxPlayers: number;
  variant?: string;
}

export interface GameSession {
  id: string;
  gameId: string;
  game: Game;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  players: PlayerGame[];
  startedAt: string | null;
  endedAt: string | null;
  winnerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerGame {
  id: string;
  gameSessionId: string;
  playerId: string;
  player: User;
  currentScore: number;
  scores: Score[];
  rank: number | null;
  joinedAt: string;
  updatedAt: string;
}

export interface Score {
  id: string;
  points: number;
  turnNumber: number;
  notes?: string;
  createdAt: string;
  playerGame: PlayerGame;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Player {
  id: string;
  username: string;
}

export interface PlayerStats {
  id: string;
  username: string;
  dartsThrown: number;
  accuracy: number;
  lastScore: number;
  score: number;
}

export interface ScoreResponse {
  score: Score;
  session: GameSession;
  currentPlayerId: string;
  isWinner: boolean;
}

export interface AddScoreData {
  playerId: string;
  points: number;
  turnNumber: number;
  isDouble?: boolean;
} 