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
import AroundTheClockGame from '../components/game-variants/AroundTheClockGame';
import { CricketGame } from '../components/game-variants/CricketGame';
import { ClassicGame } from '../components/game-variants/ClassicGame';
import GameLayout from '../components/shared/GameLayout';
import { useGameSession } from '../hooks/useGameSession';
import { useGameState } from '../hooks/useGameState';
import { useGameWebSocket, GameUpdateEvent } from '../hooks/useGameWebSocket';
import { gameService } from '../api/services';
import type { CricketThrow, CricketGameState } from '../types/variants/cricket/types';
import type { AroundTheClockThrow, AroundTheClockGameState, AroundTheClockPlayerState } from '../types/variants/aroundTheClock/types';
import type { ClassicGameState, ClassicPlayerState } from '../types/variants/classic/types';


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
      if (event.type === 'score_update' && event.cricketScore) {
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
      const state = initializeGameState();
      if (state) {
        setGameState(state);
      }
    }
  }, [session, initializeGameState, setGameState]);

  // Gestionnaires d'événements
  const handleClassicScore = async (points: number) => {
    if (!session || !gameState) {
      return;
    }

    try {
      const sessionPlayer = session.players[activePlayerIndex];
      const playerId = sessionPlayer.user?.id || sessionPlayer.guestPlayer?.id;

      if (!playerId) {
        return;
      }

      // Calculate the correct turn number based on existing scores
      const playerState = gameState.players.find(p => p.id === playerId) as ClassicPlayerState;
      const turnNumber = playerState?.scores 
        ? Math.max(...playerState.scores.map((s: { turnNumber: number }) => s.turnNumber), 0) + 1 
        : 1;

      const response = await gameService.addScore(session.game.id, session.id, {
        playerId,
        points,
        turnNumber,
        activePlayerIndex
      });

      if (response.data) {
        const { players, currentPlayerIndex, gameStatus, winner } = response.data;
        
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
          currentPlayerIndex,
          gameStatus,
          winner
        };
        
        setGameState(updatedGameState);
        setActivePlayerIndex(currentPlayerIndex);

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
      return;
    }

    try {
      const sessionPlayer = session.players[activePlayerIndex];
      const playerId = sessionPlayer.user?.id || sessionPlayer.guestPlayer?.id;

      if (!playerId) {
        return;
      }

      const response = await gameService.addCricketScore(session.game.id, session.id, {
        playerId,
        throws,
        activePlayerIndex,
        turnNumber: 1
      });

      if (response.data) {
        const { players, currentPlayerIndex, gameStatus, winner } = response.data;
        
        // Map the players data exactly as received from the server
        const updatedGameState: CricketGameState = {
          players: players.map(player => ({
            id: player.id,
            username: player.username,
            scores: player.scores,
            totalPoints: player.totalPoints
          })),
          currentPlayerIndex,
          gameStatus,
          winner
        };

        setGameState(updatedGameState);
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
      return;
    }

    const currentPlayer = gameState.players[activePlayerIndex] as AroundTheClockPlayerState;

    // Calculer les numéros validés basés sur les lancers réussis
    const validatedNumbers = Array.isArray(currentPlayer.validatedNumbers) 
      ? [...currentPlayer.validatedNumbers]
      : [];
    throws.forEach(t => {
      if (t.isHit && !validatedNumbers.includes(t.number)) {
        validatedNumbers.push(t.number);
      }
    });

    try {
      const response = await gameService.addAroundTheClockScore(
        session.game.id,
        session.id,
        {
          playerId: currentPlayer.id,
          throws,
          currentNumber: currentPlayer.currentNumber,
          validatedNumbers: validatedNumbers
        }
      );

      if (response.data) {
        // Mettre à jour l'index du joueur actif
        setActivePlayerIndex(response.data.data.currentPlayerIndex);
        // Mettre à jour l'état du jeu avec les nouvelles données
        setGameState(prevState => {
          if (!prevState) return prevState;
          
          // Convertir les joueurs avec les validatedNumbers en array
          const updatedPlayers = response.data.data.players.map(player => ({
            ...player,
            validatedNumbers: player.validatedNumbers
          }));

          return {
            ...prevState,
            players: updatedPlayers,
            status: response.data.data.status,
            currentPlayerIndex: response.data.data.currentPlayerIndex,
            lastUpdateTimestamp: response.data.data.lastUpdateTimestamp,
            variant: 'AROUND_THE_CLOCK'
          } as AroundTheClockGameState;
        });
      }
    } catch (error) {
      console.error('Error submitting Around the Clock score:', error);
    }
  };

  const handleEndGame = async (winnerId: string) => {
    // Trouver le joueur gagnant dans la session
    const winningPlayer = session?.players.find(
      player => (player.user?.id === winnerId) || (player.guestPlayer?.id === winnerId)
    );

    if (winningPlayer) {
      const username = winningPlayer.user?.username || winningPlayer.guestPlayer?.name || 'Unknown';
      setWinner({ username, id: winningPlayer.user?.id || winningPlayer.guestPlayer?.id || '' });
      setShowVictoryModal(true);
    }

    // Mettre à jour le statut de la session
    if (session?.id) {
      await endGame(winnerId);
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