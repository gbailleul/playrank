export type GameType = 'DARTS' | 'BILLIARDS';

export type DartVariant = 'FIVE_HUNDRED_ONE' | 'THREE_HUNDRED_ONE' | 'CRICKET' | 'AROUND_THE_CLOCK';

export interface CreateGameDto {
  name: string;
  description?: string;
  gameType: GameType;
  maxScore: number;
  minPlayers: number;
  maxPlayers: number;
  variant: DartVariant;
} 