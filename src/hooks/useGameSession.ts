import { useState, useCallback, useEffect } from 'react';
import { GameSession } from '../types/base/game';
import { GameStatus } from '../types/game';
import { gameService } from '../api/services';

interface UseGameSession {
  session: GameSession | null;
  loading: boolean;
  error: string | null;
  activePlayerIndex: number;
  setActivePlayerIndex: (index: number) => void;
  fetchSession: () => Promise<void>;
  moveToNextPlayer: () => void;
  endGame: (winnerId: string) => Promise<void>;
}

export const useGameSession = (gameId: string | undefined): UseGameSession => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);

  const fetchSession = useCallback(async () => {
    if (!gameId) {
      setError('No game ID provided');
      return;
    }

    setLoading(true);
    try {
      // First get the game to find the latest session
      const gameResponse = await gameService.getGame(gameId);
      const game = gameResponse.data;
      
      if (!game.sessions || game.sessions.length === 0) {
        setError('No session found');
        return;
      }
      
      // Get the latest session
      const latestSession = game.sessions[game.sessions.length - 1];
      const { data: sessionData } = await gameService.getSession(gameId, latestSession.id);
      
      // Ensure the session data has all required fields
      const validatedSession: GameSession = {
        ...sessionData,
        status: sessionData.status || GameStatus.IN_PROGRESS,
        players: sessionData.players || [],
        createdAt: new Date(sessionData.createdAt),
        updatedAt: new Date(sessionData.updatedAt)
      };
      
      setSession(validatedSession);
      
      // Get the current player index from the session data or use the active player index
      const currentIndex = (sessionData as any).currentPlayerIndex;
      if (typeof currentIndex === 'number') {
        setActivePlayerIndex(currentIndex);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setError(error instanceof Error ? error.message : 'Error loading session');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  const moveToNextPlayer = useCallback(() => {
    if (!session) return;
    const nextIndex = (activePlayerIndex + 1) % session.players.length;
    setActivePlayerIndex(nextIndex);
  }, [session, activePlayerIndex]);

  const endGame = useCallback(async (winnerId: string) => {
    if (!session || !gameId) return;
    try {
      await gameService.endSession(gameId, session.id, winnerId);
      await fetchSession();
    } catch (error) {
      console.error('Error ending game:', error);
      setError(error instanceof Error ? error.message : 'Error ending game');
    }
  }, [gameId, session, fetchSession]);

  useEffect(() => {
    if (gameId) {
      fetchSession();
    }
  }, [fetchSession, gameId]);

  return {
    session,
    loading,
    error,
    activePlayerIndex,
    setActivePlayerIndex,
    fetchSession,
    moveToNextPlayer,
    endGame
  };
}; 