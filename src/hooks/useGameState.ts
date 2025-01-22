import { useState, useCallback, useEffect } from 'react';
import { GameSession } from '../types/base/game';
import { DartVariant } from '../types/game';
import { CricketGameState, CricketScoreTarget } from '../types/variants/cricket/types';
import { AroundTheClockGameState } from '../types/variants/aroundTheClock/types';
import { ClassicGameState } from '../types/variants/classic/types';

type GameStateType = CricketGameState | AroundTheClockGameState | ClassicGameState;

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
        const cricketState = {
          players: initialSession.players.map(player => {
            const defaultScores: Record<string, CricketScoreTarget> = {
              '15': { hits: 0, points: 0 },
              '16': { hits: 0, points: 0 },
              '17': { hits: 0, points: 0 },
              '18': { hits: 0, points: 0 },
              '19': { hits: 0, points: 0 },
              '20': { hits: 0, points: 0 },
              '25': { hits: 0, points: 0 }
            };

            const existingScores = player.cricketScores?.scores as Record<string, CricketScoreTarget> | undefined;
            const scores = existingScores || defaultScores;
            
            const totalPoints = Object.values(scores).reduce(
              (sum, score) => sum + (score.points || 0),
              0
            );
            
            return {
              id: player.user?.id || player.guestPlayer?.id || '',
              username: player.user?.username || player.guestPlayer?.name || 'Unknown',
              scores,
              totalPoints
            };
          }),
          currentPlayerIndex: activePlayerIndex,
          gameStatus: initialSession.status
        } as CricketGameState;
        return cricketState;

      case DartVariant.AROUND_THE_CLOCK:
        const aroundTheClockState = {
          variant: 'AROUND_THE_CLOCK',
          status: initialSession.status,
          currentPlayerIndex: activePlayerIndex,
          players: initialSession.players.map(player => {
            const aroundTheClockScore = player.aroundTheClockScore;
            
            const throwHistory = aroundTheClockScore?.throwHistory 
              ? JSON.parse(aroundTheClockScore.throwHistory as string)
              : [];
            
            const validatedNumbers = aroundTheClockScore?.validatedNumbers
              ? JSON.parse(aroundTheClockScore.validatedNumbers as string)
              : [];
            
            return {
              id: player.user?.id || player.guestPlayer?.id || '',
              username: player.user?.username || player.guestPlayer?.name || 'Unknown',
              currentNumber: aroundTheClockScore?.currentNumber || 1,
              throwHistory,
              validatedNumbers: validatedNumbers.filter((n: any) => typeof n === 'number'),
              totalThrows: aroundTheClockScore?.totalThrows || 0,
              validatedCount: validatedNumbers.filter((n: any) => typeof n === 'number').length
            };
          }),
          lastUpdateTimestamp: Date.now(),
          winner: initialSession.winnerId
        } as AroundTheClockGameState;
        return aroundTheClockState;

      default:
        return {
          players: initialSession.players.map(player => ({
            id: player.user?.id || player.guestPlayer?.id || '',
            username: player.user?.username || player.guestPlayer?.name || 'Unknown',
            scores: player.scores || [],
            currentScore: player.currentScore
          })),
          currentPlayerIndex: activePlayerIndex,
          gameStatus: initialSession.status
        } as ClassicGameState;
    }
  }, [initialSession, variant, activePlayerIndex]);

  useEffect(() => {
    if (initialSession) {
      const newState = initializeGameState();
      if (newState) {
        setGameState(prevState => ({
          ...newState,
          currentPlayerIndex: prevState?.currentPlayerIndex ?? newState.currentPlayerIndex
        }));
      }
    }
  }, [initialSession, initializeGameState]);

  useEffect(() => {
    if (gameState) {
      setGameState(prevState => {
        if (!prevState) return null;
        return {
          ...prevState,
          currentPlayerIndex: activePlayerIndex
        } as GameStateType;
      });
    }
  }, [activePlayerIndex]);

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