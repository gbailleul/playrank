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
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { gameService } from '../api/services';
import type { CricketThrow, CricketGameState } from '../types/variants/cricket/types';
import type { AroundTheClockThrow, AroundTheClockGameState } from '../types/variants/aroundTheClock/types';
import type { ClassicGameState } from '../types/variants/classic/types';

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
        setGameState(state);
      }
    }
  }, [session, initializeGameState, setGameState]);

  // Gestionnaires d'événements
  const handleClassicScore = async (score: number, isDouble: boolean) => {
    if (!session || !gameState) return;

    const currentPlayer = session.players[activePlayerIndex];
    const remainingScore = currentPlayer.currentScore - score;

    if (remainingScore < 0) {
      setInfoMessage('Score trop élevé ! Le score ne peut pas être négatif.');
      setTimeout(() => setInfoMessage(''), 5000);
      return;
    }

    try {
      await gameService.addScore(session.game.id, session.id, {
        playerId: currentPlayer.playerId,
        points: score,
        turnNumber: currentPlayer.scores?.length || 0,
        isDouble
      });

      if (remainingScore === 0) {
        handleEndGame(currentPlayer.playerId);
      }
    } catch (error: any) {
      console.error("Error adding score:", error);
      if (error.response?.data?.message === 'Le dernier lancer doit être un double pour finir la partie') {
        setInfoMessage('💡 Règle du jeu : Pour gagner, vous devez finir sur un double ! Par exemple : double 8 pour 16 points.');
        setTimeout(() => setInfoMessage(''), 5000);
      }
    }
  };

  const handleCricketScore = async (throws: CricketThrow[]) => {
    if (!session || !gameState) return;

    const currentPlayer = session.players[activePlayerIndex];
    
    try {
      await gameService.addCricketScore(session.game.id, session.id, {
        playerId: currentPlayer.playerId,
        throws,
        turnNumber: currentPlayer.scores?.length || 0
      });

      moveToNextPlayer();
    } catch (error) {
      console.error("Error adding cricket score:", error);
      setInfoMessage('Erreur lors de l\'ajout du score');
      setTimeout(() => setInfoMessage(''), 5000);
    }
  };

  const handleAroundTheClockScore = async (throws: AroundTheClockThrow[]) => {
    if (!session || !gameState) return;

    const currentPlayer = session.players[activePlayerIndex];
    const currentState = gameState as AroundTheClockGameState;
    const currentPlayerState = currentState.players.find(p => p.id === currentPlayer.playerId);
    
    if (!currentPlayerState) return;
    
    try {
      await gameService.addAroundTheClockScore(session.game.id, session.id, {
        playerId: currentPlayer.playerId,
        throws,
        currentNumber: currentPlayerState.currentNumber,
        validatedNumbers: Array.from(currentPlayerState.validatedNumbers)
      });

      moveToNextPlayer();
    } catch (error) {
      console.error("Error adding around the clock score:", error);
      setInfoMessage('Erreur lors de l\'ajout du score');
      setTimeout(() => setInfoMessage(''), 5000);
    }
  };

  const handleEndGame = async (winnerId: string) => {
    if (!session || !gameState) return;

    try {
      await endGame(winnerId, session.game.variant);
      
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
    } catch (err) {
      console.error("Error ending game:", err);
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
          onTurnComplete={moveToNextPlayer}
        />
      ) : session.game.variant === DartVariant.AROUND_THE_CLOCK ? (
        <AroundTheClockGame
          session={session}
          gameState={gameState as AroundTheClockGameState}
          activePlayerIndex={activePlayerIndex}
          onScoreSubmit={handleAroundTheClockScore}
          onTurnComplete={moveToNextPlayer}
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