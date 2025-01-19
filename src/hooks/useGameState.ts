import { useState, useCallback } from 'react';
import { GameSession } from '../types/base/game';
import { DartVariant } from '../types/game';
import { CricketGameState, CricketPlayerState } from '../types/variants/cricket/types';
import { AroundTheClockGameState, AroundTheClockPlayerState } from '../types/variants/aroundTheClock/types';
import { ClassicGameState, ClassicPlayerState } from '../types/variants/classic/types';

type GameStateType = CricketGameState | AroundTheClockGameState | ClassicGameState;
type PlayerStateType = CricketPlayerState | AroundTheClockPlayerState | ClassicPlayerState;

export const useGameState = (
  initialSession: GameSession | null,
  variant: DartVariant,
  activePlayerIndex: number
) => {
  const [gameState, setGameState] = useState<GameStateType | null>(null);

  const initializeGameState = useCallback(() => {
    if (!initialSession || !initialSession.game) return null;

    switch (variant) {
      case DartVariant.CRICKET:
        return {
          players: initialSession.players.map(player => ({
            id: player.playerId,
            username: player.user?.username || player.guestPlayer?.name || 'Unknown',
            scores: {},
            totalPoints: 0
          })),
          currentPlayerIndex: activePlayerIndex,
          gameStatus: initialSession.status
        } as CricketGameState;

      case DartVariant.AROUND_THE_CLOCK:
        return {
          variant: 'AROUND_THE_CLOCK',
          status: initialSession.status,
          currentPlayerIndex: activePlayerIndex,
          players: initialSession.players.map(player => ({
            id: player.playerId,
            username: player.user?.username || player.guestPlayer?.name || 'Unknown',
            currentNumber: 1,
            throwHistory: [],
            validatedNumbers: new Set<number>(),
            totalThrows: 0,
            validatedCount: 0
          })),
          lastUpdateTimestamp: Date.now()
        } as AroundTheClockGameState;

      default:
        return {
          players: initialSession.players.map(player => ({
            id: player.playerId,
            username: player.user?.username || player.guestPlayer?.name || 'Unknown',
            scores: player.scores,
            currentScore: initialSession.game?.maxScore || 501 // Valeur par défaut si maxScore n'est pas défini
          })),
          currentPlayerIndex: activePlayerIndex,
          gameStatus: initialSession.status
        } as ClassicGameState;
    }
  }, [initialSession, variant, activePlayerIndex]);

  const updateGameState = useCallback((
    updater: (prevState: GameStateType) => GameStateType
  ) => {
    setGameState(prev => prev ? updater(prev) : null);
  }, []);

  return {
    gameState,
    setGameState,
    updateGameState,
    initializeGameState
  };
}; 