/**
 * GameSession.tsx
 * Composant principal gérant une session de jeu de fléchettes.
 * 
 * Fonctionnalités :
 * - Gestion des différentes variantes de jeu (301, 501, Cricket)
 * - Suivi des scores et des tours de jeu
 * - Interaction avec le backend via WebSocket
 * - Affichage des statistiques en temps réel
 * 
 * Structure des données :
 * - session: Données complètes de la session de jeu
 * - gameState: État spécifique pour le Cricket (zones fermées, points)
 * - dartHits: Suivi des impacts de fléchettes du tour en cours
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DartVariant, GameStatus } from '../types/game';
import { AroundTheClockGame } from '../components/game-variants/AroundTheClockGame';
import { CricketGame } from '../components/game-variants/CricketGame';
import { ClassicGame } from '../components/game-variants/ClassicGame';
import GameLayout from '../components/shared/GameLayout';
import { useGameSession } from '../hooks/useGameSession';
import { useGameState } from '../hooks/useGameState';
import { useGameWebSocket, GameUpdateEvent } from '../hooks/useGameWebSocket';
import { gameService } from '../api/services';
import type { CricketThrow, CricketGameState } from '../types/variants/cricket/types';
import type { AroundTheClockThrow, AroundTheClockGameState } from '../types/variants/aroundTheClock/types';
import type { ClassicGameState, ClassicPlayerState } from '../types/variants/classic/types';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

interface PlayerInGame {
  id: string;
  user: User;
  currentScore: number;
  scores: Array<{ id: string }>;
}

const GameSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [infoMessage, setInfoMessage] = useState<string>('');
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [winner, setWinner] = useState<{ username: string; id: string; } | undefined>(undefined);

  // Hooks personnalisés pour la gestion de l'état
  const {
    session,
    loading,
    error,
    activePlayerIndex,
    setActivePlayerIndex,
    fetchSession,
    moveToNextPlayer,
    endGame
  } = useGameSession(id);

  // Déterminer le variant de jeu
  const gameVariant = session?.game?.variant || DartVariant.FIVE_HUNDRED_ONE;

  const {
    gameState,
    setGameState,
    initializeGameState
  } = useGameState(session, gameVariant, activePlayerIndex);

  // Hook WebSocket
  const socket = useGameWebSocket(session?.game || null, user);

  // Gestion des événements WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleGameUpdate = (event: GameUpdateEvent) => {
      console.log('WebSocket game update received:', event);
      if (event.type === 'score_update' && event.cricketScore) {
        console.log('Cricket score update received:', event.cricketScore);
        fetchSession();
      }
    };

    socket.on('game_update', handleGameUpdate);

    return () => {
      socket.off('game_update', handleGameUpdate);
    };
  }, [socket, fetchSession]);

  // Initialisation
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (session) {
      console.log('Session loaded:', session);
      const state = initializeGameState();
      console.log('Initial game state:', state);
      if (state) {
        console.log('Setting game state:', state);
        setGameState(state);
      } else {
        console.error('Failed to initialize game state');
      }
    }
  }, [session, initializeGameState, setGameState]);

  // Gestionnaires d'événements
  const handleClassicScore = async (points: number) => {
    if (!session || !gameState) {
      console.log('No session or gameState:', { session, gameState });
      return;
    }

    try {
      const sessionPlayer = session.players[activePlayerIndex];
      const playerId = sessionPlayer.user?.id || sessionPlayer.guestPlayer?.id;

      if (!playerId) {
        console.error('No player ID found');
        return;
      }

      // Calculate the correct turn number based on existing scores
      const playerState = gameState.players.find(p => p.id === playerId) as ClassicPlayerState;
      const turnNumber = playerState?.scores 
        ? Math.max(...playerState.scores.map((s: { turnNumber: number }) => s.turnNumber), 0) + 1 
        : 1;

      console.log('Submitting score:', { playerId, points, activePlayerIndex, turnNumber });
      const response = await gameService.addScore(session.game.id, session.id, {
        playerId,
        points,
        turnNumber,
        activePlayerIndex
      });

      console.log('Score submission response:', response.data);
      if (response.data) {
        const { players, gameStatus, winner } = response.data;
        
        // Calculate next player locally
        const nextPlayerIndex = (activePlayerIndex + 1) % session.players.length;
        
        // Update the game state with the new data, maintaining original player order
        const updatedGameState: ClassicGameState = {
          players: session.players.map(sessionPlayer => {
            const player = players.find(p => 
              (sessionPlayer.user?.id === p.id) || (sessionPlayer.guestPlayer?.id === p.id)
            );
            return {
              id: sessionPlayer.user?.id || sessionPlayer.guestPlayer?.id || '',
              username: sessionPlayer.user?.username || sessionPlayer.guestPlayer?.name || 'Unknown',
              scores: player?.scores || [],
              currentScore: player?.currentScore || session.game.maxScore
            };
          }),
          currentPlayerIndex: nextPlayerIndex,
          gameStatus,
          winner
        };
        
        console.log('Updated game state:', updatedGameState);
        setGameState(updatedGameState);
        setActivePlayerIndex(nextPlayerIndex);

        // Fetch the latest session data
        await fetchSession();

        if (gameStatus === GameStatus.COMPLETED && winner) {
          handleEndGame(winner);
        }
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  const handleCricketScore = async (throws: CricketThrow[]) => {
    if (!session || !gameState) {
      console.log('No session or gameState:', { session, gameState });
      return;
    }

    try {
      const sessionPlayer = session.players[activePlayerIndex];
      const playerId = sessionPlayer.user?.id || sessionPlayer.guestPlayer?.id;

      if (!playerId) {
        console.error('No player ID found');
        return;
      }

      const response = await gameService.addCricketScore(session.game.id, session.id, {
        playerId,
        throws,
        turnNumber: 1,
        activePlayerIndex
      });

      if (response.data) {
        const { players, currentPlayerIndex, gameStatus, winner } = response.data;
        setGameState(prevState => ({
          ...prevState,
          players,
          currentPlayerIndex,
          gameStatus,
          winner
        }));
        setActivePlayerIndex(currentPlayerIndex);

        if (gameStatus === 'COMPLETED' && winner) {
          handleEndGame(winner);
        }
      }
    } catch (error) {
      console.error('Error submitting cricket score:', error);
      setInfoMessage('Erreur lors de l\'envoi du score');
      setTimeout(() => setInfoMessage(''), 5000);
    }
  };

  const handleAroundTheClockScore = async (throws: AroundTheClockThrow[]) => {
    if (!session || !gameState) {
      console.log('No session or gameState:', { session, gameState });
      return;
    }

    try {
      const sessionPlayer = session.players[activePlayerIndex];
      const playerId = sessionPlayer.user?.id || sessionPlayer.guestPlayer?.id;

      if (!playerId) {
        console.error('No player ID found');
        return;
      }

      console.log('Submitting score:', { playerId, throws, activePlayerIndex });
      const response = await gameService.addAroundTheClockScore(session.game.id, session.id, {
        playerId,
        throws,
        turnNumber: 1,
        activePlayerIndex
      });

      console.log('Score submission response:', response.data);
      if (response.data) {
        const { players, currentPlayerIndex, status, winner } = response.data;
        
        // Update the game state with the new data
        const updatedGameState: AroundTheClockGameState = {
          ...gameState,
          players: players.map(player => ({
            id: player.id,
            username: player.username,
            throwHistory: player.throwHistory,
            currentNumber: player.currentNumber,
            validatedNumbers: new Set(player.validatedNumbers),
            totalThrows: player.totalThrows || 0,
            validatedCount: player.validatedCount || 0
          })),
          currentPlayerIndex,
          status,
          variant: 'AROUND_THE_CLOCK',
          lastUpdateTimestamp: Date.now()
        };
        
        console.log('Updated game state:', updatedGameState);
        setGameState(updatedGameState);
        setActivePlayerIndex(currentPlayerIndex);

        if (status === 'COMPLETED' && winner) {
          handleEndGame(winner);
        }
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  const calculateCricketStats = () => {
    if (!session || !gameState || session.game.variant !== DartVariant.CRICKET) return null;

    const cricketGameState = gameState as CricketGameState;
    const currentPlayer = session.players[activePlayerIndex] as PlayerInGame;
    if (!currentPlayer.user) return null;

    const allPlayers = session.players.map(player => {
      const playerState = cricketGameState.players.find(p => p.id === player.playerId);
      if (!playerState || !player.user) return null;

      const scores = playerState.scores as Record<string, { hits: number; points: number }>;
      const closedTargets = Object.values(scores).filter(score => score.hits >= 3).length;
      const totalHits = Object.values(scores).reduce((sum, score) => sum + score.hits, 0);
      const totalPoints = playerState.totalPoints;

      return {
        id: player.user.id,
        closedTargets,
        totalPoints,
        totalHits
      };
    }).filter((player): player is NonNullable<typeof player> => player !== null);

    const winner = allPlayers.find(player => player.id === session.winnerId);
    if (!winner || allPlayers.length === 0) return null;

    const duration = session.updatedAt.getTime() - session.createdAt.getTime();

    return {
      variant: 'CRICKET' as const,
      duration,
      winner,
      players: allPlayers
    };
  };

  const handleEndGame = async (winnerId: string) => {
    if (!session) return;

    try {
      if (session.game.variant === DartVariant.CRICKET) {
        const stats = calculateCricketStats();
        if (stats) {
          await gameService.endSession(session.game.id, session.id, winnerId, stats);
        } else {
          await gameService.endSession(session.game.id, session.id, winnerId);
        }
      } else {
        await gameService.endSession(session.game.id, session.id, winnerId);
      }
      
      const winningPlayer = session.players.find(p => p.playerId === winnerId);
      if (winningPlayer) {
        setWinner({
          username: winningPlayer.user?.username || winningPlayer.guestPlayer?.name || 'Unknown',
          id: winnerId
        });
        setShowVictoryModal(true);
      }
      
      socket?.emit('game_update', {
        type: 'game_status_update',
        gameId: session.game.id,
        status: GameStatus.COMPLETED
      });
    } catch (error) {
      console.error('Error ending game:', error);
      setInfoMessage('Erreur lors de la fin de partie');
      setTimeout(() => setInfoMessage(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[var(--neon-primary)]"></div>
      </div>
    );
  }

  if (error || !session || !gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-[var(--text-primary)] mb-4">
          {error || "Impossible de charger la session de jeu"}
        </div>
        <button
          onClick={() => navigate('/games')}
          className="text-[var(--neon-primary)] hover:underline"
        >
          Retour aux jeux
        </button>
      </div>
    );
  }

  return (
    <GameLayout
      title={session.game.name}
      infoMessage={infoMessage}
      showVictoryModal={showVictoryModal}
          winner={winner}
      onVictoryClose={() => {
            setShowVictoryModal(false);
            navigate('/dashboard');
          }}
    >
      {session.game.variant === DartVariant.CRICKET ? (
        <CricketGame
          session={session}
          gameState={gameState as CricketGameState}
          activePlayerIndex={activePlayerIndex}
          onScoreSubmit={handleCricketScore}
        />
      ) : session.game.variant === DartVariant.AROUND_THE_CLOCK ? (
        <AroundTheClockGame
          session={session}
          gameState={gameState as AroundTheClockGameState}
          activePlayerIndex={activePlayerIndex}
          onScoreSubmit={handleAroundTheClockScore}
        />
      ) : (
        <ClassicGame
          session={session}
          gameState={gameState as ClassicGameState}
          activePlayerIndex={activePlayerIndex}
          onScoreSubmit={handleClassicScore}
        />
      )}
    </GameLayout>
  );
};

export default GameSession; 