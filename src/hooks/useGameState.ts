import { useState, useCallback, useEffect, useRef } from 'react';
import { GameSession } from '../types/base/game';
import { DartVariant, GameStatus } from '../types/game';
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
  const lastSessionId = useRef<string | null>(null);

  const initializeGameState = useCallback(() => {
    if (!initialSession || !initialSession.game) return null;

    if (lastSessionId.current === initialSession.id && gameState) {
      console.log('Same session, keeping current state');
      return gameState;
    }

    lastSessionId.current = initialSession.id;

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
        const classicState = {
          players: initialSession.players.map(player => ({
            id: player.user?.id || player.guestPlayer?.id || '',
            username: player.user?.username || player.guestPlayer?.name || 'Unknown',
            scores: [...(player.scores || [])].sort((a, b) => b.turnNumber - a.turnNumber),
            currentScore: player.currentScore
          })),
          currentPlayerIndex: activePlayerIndex,
          gameStatus: initialSession.status
        } as ClassicGameState;
        console.log('Initialized classic game state:', classicState);
        return classicState;
    }
  }, [initialSession, variant, activePlayerIndex, gameState]);

  useEffect(() => {
    if (initialSession?.id && (!gameState || lastSessionId.current !== initialSession.id)) {
      console.log('Initializing game state from session');
      const state = initializeGameState();
      if (state) {
        console.log('Setting initial game state:', state);
        setGameState(state);
      }
    }
  }, [initialSession, initializeGameState, gameState]);

  const updateGameState = useCallback((
    updater: (prevState: GameStateType) => GameStateType
  ) => {
    setGameState(prev => {
      if (!prev) return null;
      const updated = updater(prev);
      console.log('Updating game state:', updated);
      return updated;
    });
  }, []);

  return {
    gameState,
    setGameState,
    updateGameState,
    initializeGameState
  };
}; 