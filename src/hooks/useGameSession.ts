import { useState, useCallback, useEffect } from 'react';
import { GameStatus } from '../types/game';
import { gameService } from '../api/services';
import type { GameSession } from '../types/base/game';
import type { PlayerGame } from '../types/base/player';

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
      
      // Ensure the session data has all required fields and convert types
      const validatedPlayers: PlayerGame[] = sessionData.players.map((player: any) => ({
        ...player,
        scores: player.scores || [],
        cricketScores: player.cricketScores ? {
          id: player.cricketScores.id,
          scores: player.cricketScores.scores,
          createdAt: new Date(player.cricketScores.createdAt)
        } : undefined,
        joinedAt: new Date(player.joinedAt),
        currentScore: player.currentScore || 0
      }));

      const validatedSession: GameSession = {
        ...sessionData,
        status: sessionData.status || GameStatus.IN_PROGRESS,
        players: validatedPlayers,
        createdAt: new Date(sessionData.createdAt),
        updatedAt: new Date(sessionData.updatedAt),
        game: {
          ...sessionData.game,
          sessions: sessionData.game.sessions?.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt)
          }))
        }
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