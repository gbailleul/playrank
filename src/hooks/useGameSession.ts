import { useState, useCallback } from 'react';
import { GameSession } from '../types/base/game';
import { gameService } from '../api/services';
import { DartVariant } from '../types/game';
import { CricketGameStats } from '../types/variants/cricket/types';

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
      const data = response.data;
      console.log('Game data received:', data);
      
      const gameSession = data.sessions?.[data.sessions.length - 1];
      console.log('Latest game session:', gameSession);

      if (!data) {
        console.error('No game data received');
        setError('No game data received');
        return;
      }

      if (!gameSession) {
        console.error('No game session found');
        setError('No game session found');
        return;
      }

      if (!gameSession.players || gameSession.players.length === 0) {
        console.error('No players in session');
        setError('No players in session');
        return;
      }
      
      // Trouver l'index du joueur actif en fonction du nombre de scores
      const playerScoreCounts = gameSession.players.map(p => p.scores?.length || 0);
      const minScores = Math.min(...playerScoreCounts);
      const activePlayerIdx = playerScoreCounts.findIndex(count => count === minScores);
      
      console.log('Building session with game data');
      // Inclure les données du jeu dans la session
      const sessionWithGame: GameSession = {
        id: gameSession.id,
        gameId: data.id,
        status: gameSession.status,
        players: gameSession.players,
        winnerId: gameSession.winnerId,
        createdAt: new Date(gameSession.createdAt),
        updatedAt: new Date(gameSession.updatedAt),
        game: {
          id: data.id,
          name: data.name,
          description: data.description,
          gameType: data.gameType,
          maxScore: data.maxScore,
          minPlayers: data.minPlayers,
          maxPlayers: data.maxPlayers,
          creatorId: data.creatorId,
          variant: data.variant || DartVariant.FIVE_HUNDRED_ONE,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        }
      };
      
      console.log('Final session object:', sessionWithGame);
      setSession(sessionWithGame);
      setActivePlayerIndex(activePlayerIdx);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError('Failed to load game session');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  const moveToNextPlayer = useCallback(() => {
    if (!session) return;
    
    const nextPlayerIndex = (activePlayerIndex + 1) % session.players.length;
    console.log('Passage au joueur suivant:', {
      currentIndex: activePlayerIndex,
      nextIndex: nextPlayerIndex,
      totalPlayers: session.players.length
    });
    
    setActivePlayerIndex(nextPlayerIndex);
  }, [activePlayerIndex, session]);

  const endGame = useCallback(async (
    winnerId: string,
    variant: DartVariant,
    stats?: CricketGameStats
  ) => {
    if (!session) return;

    try {
      if (variant === DartVariant.CRICKET && stats) {
        await gameService.endSession(session.game.id, session.id, winnerId, stats);
      } else {
        await gameService.endSession(session.game.id, session.id, winnerId);
      }
    } catch (err) {
      console.error("Error ending game:", err);
      setError('Failed to end game');
    }
  }, [session]);

  return {
    session,
    setSession,
    loading,
    error,
    activePlayerIndex,
    setActivePlayerIndex,
    fetchSession,
    moveToNextPlayer,
    endGame
  };
}; 