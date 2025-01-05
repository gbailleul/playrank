export enum GameType {
  GAME_301 = 'GAME_301',
  GAME_501 = 'GAME_501',
  CRICKET = 'CRICKET'
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

export type UserRole = 'ADMIN' | 'PLAYER' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface UserStatistics {
  gamesCreated: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  averagePointsPerDart: number;
  accuracy: number;
  highestScore: number;
  totalDoubles: number;
  totalTriples: number;
  totalDartsThrown: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  statistics?: UserStatistics;
  playerGames?: PlayerGame[];
  recentActivity?: UserActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface UserActivity {
  type: 'game_created' | 'game_played';
  game: GameInfo;
  timestamp: string;
  result?: GameResult;
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
  playerId: string;
  gameSession: GameSession;
  scores: Score[];
  rank: number | null;
  joinedAt: string;
}

export interface Score {
  id: string;
  points: number;
  turnNumber: number;
  createdAt: string;
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
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  globalStats: {
    averageAccuracy: number;
    averagePointsPerDart: number;
    averageGamesPerPlayer: number;
    totalDartsThrown: number;
    totalDoubles: number;
    totalTriples: number;
  };
  topPlayers: {
    id: string;
    username: string;
    avatarUrl?: string;
    statistics: {
      gamesWon: number;
      winRate: number;
      averagePointsPerDart: number;
    };
  }[];
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatarUrl?: string;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  averagePointsPerDart: number;
  accuracy: number;
  rank: number;
}

export interface LeaderboardResponse {
  gameType: GameType;
  entries: LeaderboardEntry[];
  totalPlayers: number;
  userRank?: LeaderboardEntry;
}

export interface GameResult {
  won: boolean;
  rank?: number;
}

export interface GameInfo {
  id: string;
  name: string;
  gameType: string;
} 