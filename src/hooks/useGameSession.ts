import { useState, useCallback } from 'react';
import { GameSession } from '../types/base/game';
import { gameService } from '../api/services';
import { CricketGameStats } from '../types/variants/cricket/types';


export const useGameSession = (gameId: string | undefined) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);

  const fetchSession = useCallback(async () => {
    if (!gameId) {
      return;
    }

    setLoading(true);
    try {
      const gameResponse = await gameService.getGame(gameId);
      const game = gameResponse.data;
      if (!game.sessions || game.sessions.length === 0) {
        setError('Aucune session trouvée');
        return;
      }
      const latestSession = game.sessions[game.sessions.length - 1];
      const sessionResponse = await gameService.getSession(gameId, latestSession.id);
      setSession(sessionResponse.data as unknown as GameSession);
    } catch (error) {
      setError('Erreur lors du chargement de la session');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  const moveToNextPlayer = useCallback(() => {
    if (!session?.players) return;
    setActivePlayerIndex((current) => (current + 1) % session.players.length);
  }, [session]);

  const endGame = useCallback(async (winnerId: string, gameStats?: CricketGameStats) => {
    if (!gameId || !session?.id) return;
    
    try {
      await gameService.endSession(gameId, session.id, winnerId, gameStats);
      await fetchSession();
    } catch (err) {
      console.error('Error ending game:', err);
      setError('Error ending game');
    }
  }, [gameId, session, fetchSession]);

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