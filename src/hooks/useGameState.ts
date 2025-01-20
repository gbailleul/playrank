import { useState, useCallback, useEffect } from 'react';
import { GameSession } from '../types/base/game';
import { DartVariant } from '../types/game';
import { CricketGameState, CricketPlayerState, CricketScoreTarget } from '../types/variants/cricket/types';
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
        console.log('Initializing Cricket game state with session:', initialSession);
        const cricketState = {
          players: initialSession.players.map(player => {
            console.log('Processing player:', player);
            console.log('Player cricket scores:', player.cricketScores);
            
            // Initialiser les scores avec des valeurs par défaut
            const defaultScores: Record<string, CricketScoreTarget> = {
              '15': { hits: 0, points: 0 },
              '16': { hits: 0, points: 0 },
              '17': { hits: 0, points: 0 },
              '18': { hits: 0, points: 0 },
              '19': { hits: 0, points: 0 },
              '20': { hits: 0, points: 0 },
              '25': { hits: 0, points: 0 }
            };
            
            // Fusionner avec les scores existants s'ils existent
            const scores = player.cricketScores?.scores
              ? { ...defaultScores, ...player.cricketScores.scores }
              : defaultScores;
            
            console.log('Final scores for player:', scores);
            
            // Calculer les points totaux
            const totalPoints = Object.values(scores).reduce(
              (sum, score) => {
                console.log('Adding points:', score.points);
                return sum + (score.points || 0);
              }, 
              0
            );
            console.log('Total points calculated:', totalPoints);
            
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
        console.log('Created Cricket game state:', cricketState);
        return cricketState;

      case DartVariant.AROUND_THE_CLOCK:
        return {
          variant: 'AROUND_THE_CLOCK',
          status: initialSession.status,
          currentPlayerIndex: activePlayerIndex,
          players: initialSession.players.map(player => ({
            id: player.id,
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
            id: player.id,
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
      console.log('Session changed, reinitializing game state');
      const newState = initializeGameState();
      if (newState) {
        console.log('Setting new game state:', newState);
        setGameState(newState);
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