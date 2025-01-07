import { DartVariant, GameType } from "./types/game";

export interface CreateGameDto {
  name: string;
  description?: string;
  gameType: GameType;
  maxScore: number;
  minPlayers: number;
  maxPlayers: number;
  variant: DartVariant;
} 