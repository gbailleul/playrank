import { useState, useCallback } from 'react';
import { GameSession, Game } from '../types/base/game';
import { gameService } from '../api/services';
import { DartVariant } from '../types/game';
import { CricketGameStats } from '../types/variants/cricket/types';

interface PlayerGame {
  id: string;
  scores?: Array<{ id: string }>;
}

export const useGameSession = (gameId: string | undefined) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);

  const fetchSession = useCallback(async () => {
    if (!gameId) {
      console.log('No gameId provided');
      return;
    }
    
    try {
      console.log('Fetching game with ID:', gameId);
      const response = await gameService.getGame(gameId);
      const game = response.data as Game;
      console.log('Game data received:', game);
      
      if (!game) {
        console.error('No game data received');
        setError('No game data received');
        return;
      }

      const latestSession = game.sessions?.[game.sessions.length - 1];
      if (!latestSession) {
        console.error('No game session found');
        setError('No game session found');
        return;
      }

      console.log('Latest session ID:', latestSession.id);
      const sessionResponse = await gameService.getSession(gameId, latestSession.id);
      const sessionData = sessionResponse.data as unknown as GameSession;
      console.log('Session data received:', sessionData);

      if (!sessionData || !sessionData.players || sessionData.players.length === 0) {
        console.error('No players in session');
        setError('No players in session');
        return;
      }
      
      // Trouver l'index du joueur actif en fonction du nombre de scores
      const playerScoreCounts = sessionData.players.map((player: PlayerGame) => player.scores?.length || 0);
      const minScores = Math.min(...playerScoreCounts);
      const activePlayerIdx = playerScoreCounts.findIndex((count: number) => count === minScores);
      
      setActivePlayerIndex(activePlayerIdx);
      setSession(sessionData);
      setError('');
    } catch (err) {
      console.error('Error fetching session:', err);
      setError('Error fetching session');
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