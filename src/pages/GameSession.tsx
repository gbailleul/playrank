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
import CricketGame from '../components/game-variants/CricketGame';
import { ClassicGame } from '../components/game-variants/ClassicGame';
import GameLayout from '../components/shared/GameLayout';
import { useGameSession } from '../hooks/useGameSession';
import { useGameState } from '../hooks/useGameState';
import { useGameWebSocket, GameUpdateEvent } from '../hooks/useGameWebSocket';
import { gameService } from '../api/services';
import type { CricketThrow, CricketGameState, CricketPlayerState, CricketScoreTarget, CricketPlayerResponse } from '../types/variants/cricket/types';
import { DEFAULT_CRICKET_SCORES } from '../types/variants/cricket/types';
import type { AroundTheClockThrow, AroundTheClockGameState, AroundTheClockPlayerState } from '../types/variants/aroundTheClock/types';
import type { ClassicGameState, ClassicPlayerState } from '../types/variants/classic/types';
import type { CricketScoreResponse } from '../types/base/game';
import type { PlayerGame } from '../types/base/player';


const GameSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [infoMessage, setInfoMessage] = useState<string>('');
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [winner, setWinner] = useState<{ username: string; id: string; } | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Hook WebSocket avec une référence stable au jeu
  const gameRef = React.useMemo(() => session?.game || null, [session?.game]);
  const { subscribe, isConnected } = useGameWebSocket(gameRef, user);

  // Gestionnaires d'événements
  const handleClassicScore = async (points: number) => {
    if (!session || !gameState || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const sessionPlayer = session.players[activePlayerIndex];
      const playerId = sessionPlayer.user?.id || sessionPlayer.guestPlayer?.id;

      if (!playerId) {
        return;
      }

      const player = gameState.players.find(p => p.id === playerId);
      const turnNumber = gameVariant === DartVariant.FIVE_HUNDRED_ONE || gameVariant === DartVariant.THREE_HUNDRED_ONE
        ? (player as ClassicPlayerState)?.scores?.length || 0
        : 0;

      // Envoyer le score au serveur
      const response = await gameService.addScore(session.game.id, session.id, {
        playerId,
        points,
        turnNumber: turnNumber + 1,
        activePlayerIndex
      });

      // Mettre à jour l'état immédiatement avec la réponse
      if (response.data) {
        const { players, currentPlayerIndex, gameStatus, winner } = response.data;
        
        const updatedGameState: ClassicGameState = {
          players: players.map(player => ({
            id: player.id,
            username: player.username,
            scores: player.scores.map(score => ({
              id: score.id,
              points: score.points,
              turnNumber: score.turnNumber,
              createdAt: new Date(score.createdAt),
              isDouble: score.isDouble || false
            })).sort((a, b) => b.turnNumber - a.turnNumber),
            currentScore: player.currentScore
          })),
          currentPlayerIndex: currentPlayerIndex || 0,
          gameStatus: gameStatus || 'IN_PROGRESS',
          winner: winner
        };

        console.log('Updating game state from response:', updatedGameState);
        setGameState(updatedGameState);
        setActivePlayerIndex(currentPlayerIndex || 0);
      }
      
    } catch (error) {
      console.error('Error submitting score:', error);
      setInfoMessage('Erreur lors de l\'envoi du score');
      setTimeout(() => setInfoMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCricketScore = async (throws: CricketThrow[]) => {
    if (!session || !gameState || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const sessionPlayer = session.players[activePlayerIndex];
      const playerId = sessionPlayer.user?.id || sessionPlayer.guestPlayer?.id;

      if (!playerId) {
        return;
      }

      console.log('Current session players:', session.players.map((p: PlayerGame) => ({
        id: p.user?.id || p.guestPlayer?.id,
        name: p.user?.username || p.guestPlayer?.name
      })));
      console.log('Active player index:', activePlayerIndex);
      console.log('Active player:', {
        id: playerId,
        name: sessionPlayer.user?.username || sessionPlayer.guestPlayer?.name
      });
      console.log('Submitting cricket score:', {
        playerId,
        throws,
        activePlayerIndex,
        turnNumber: 1
      });

      const response = await gameService.addCricketScore(session.game.id, session.id, {
        playerId,
        throws,
        activePlayerIndex,
        turnNumber: 1
      });

      // Mise à jour immédiate avec la réponse du serveur
      if (response.data) {
        const { players, currentPlayerIndex, gameStatus, winner } = response.data as CricketScoreResponse;
        
        // Récupérer l'ordre des joueurs de la session
        const sessionPlayerIds = session.players
          .map((p: PlayerGame) => p.user?.id || p.guestPlayer?.id)
          .filter((id): id is string => id !== undefined);
        
        // Convertir d'abord les données du serveur en format compatible
        const cricketPlayers = players.map(player => ({
          id: player.id,
          username: player.username,
          scores: player.scores,
          totalPoints: 'currentScore' in player ? player.currentScore : 0
        })) as unknown as CricketPlayerResponse[];
        
        // Mapper les joueurs avec leurs scores
        const mappedPlayers = cricketPlayers.map(player => {
          const scores: Record<string, CricketScoreTarget> = { ...DEFAULT_CRICKET_SCORES };
          
          if (Array.isArray(player.scores)) {
            // Si les scores sont un tableau (Score[]), les convertir en format Cricket
            player.scores.forEach(score => {
              const target = score.points.toString();
              if (scores[target]) {
                scores[target] = {
                  hits: score.isDouble ? 2 : 1,
                  points: score.points
                };
              }
            });
          } else {
            // Si les scores sont déjà au format Cricket, les utiliser directement
            Object.entries(player.scores).forEach(([target, score]) => {
              if (scores[target]) {
                scores[target] = score;
              }
            });
          }
          
          return {
            id: player.id,
            username: player.username,
            scores,
            totalPoints: player.totalPoints || Object.values(scores)
              .reduce((sum, score) => sum + score.points, 0)
          };
        });
        
        // Réorganiser les joueurs selon l'ordre de la session
        const reorderedPlayers = sessionPlayerIds
          .map((id: string) => mappedPlayers.find(p => p.id === id))
          .filter((player): player is CricketPlayerState => player !== undefined);
        
        const cricketState: CricketGameState = {
          players: reorderedPlayers,
          currentPlayerIndex: currentPlayerIndex || 0,
          gameStatus: gameStatus || 'IN_PROGRESS',
          winner: winner
        };
        
        setGameState(cricketState);
        setActivePlayerIndex(currentPlayerIndex || 0);

        if (gameStatus === 'COMPLETED' && winner) {
          handleEndGame(winner);
        }
      }
    } catch (error) {
      console.error('Error submitting cricket score:', error);
      setInfoMessage('Erreur lors de l\'envoi du score');
      setTimeout(() => setInfoMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
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
            variant: 'AROUND_THE_CLOCK',
            winner: response.data.data.winner
          } as AroundTheClockGameState;
        });
      }
    } catch (error) {
      console.error('Error submitting Around the Clock score:', error);
    }
  };

  const handleEndGame = async (winnerId?: string) => {
    if (!session || !winnerId) return;
    try {
      await endGame(winnerId);
      setShowVictoryModal(true);
      const winner = session.players.find((p: PlayerGame) => 
        (p.user?.id === winnerId) || (p.guestPlayer?.id === winnerId)
      );
      if (winner) {
        setWinner({
          id: winnerId,
          username: winner.user?.username || winner.guestPlayer?.name || 'Unknown'
        });
      }
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  // Initialisation de la session
  useEffect(() => {
    console.log('Fetching initial session data');
    fetchSession();
  }, [fetchSession]);

  // Initialiser l'état du jeu uniquement au chargement initial
  useEffect(() => {
    if (session?.id) {
      console.log('Initializing game state from session');
      const state = initializeGameState();
      if (state) {
        setGameState(state);
      }
    }
  }, [session?.id, initializeGameState]);

  // Gestion des événements WebSocket
  useEffect(() => {
    if (!isConnected || !session) {
      console.log('Not connected or no session, skipping WebSocket setup');
      return;
    }

    console.log('Setting up WebSocket event handlers');
    const unsubscribe = subscribe('game_update', (event: GameUpdateEvent) => {
      console.log('WebSocket event received:', event);
      
      if (event.type === 'score_update' && event.score) {
        const { players, currentPlayerIndex, gameStatus, winner } = event.score;
        
        if (!Array.isArray(players)) {
          console.error('Invalid players data received:', event.score);
          return;
        }

        // Pour les jeux Classic, on laisse la mise à jour se faire via handleClassicScore
        if (gameVariant === DartVariant.FIVE_HUNDRED_ONE || 
            gameVariant === DartVariant.THREE_HUNDRED_ONE) {
          console.log('Classic game update - handled by handleClassicScore');
          return;
        }

        // Pour Cricket, on met à jour immédiatement avec la réponse
        if (gameVariant === DartVariant.CRICKET) {
          console.log('WebSocket event data:', event.score);
          console.log('WebSocket players data:', event.score.players);
          
          // Récupérer l'ordre des joueurs de la session
          const sessionPlayerIds = session.players
            .map((p: PlayerGame) => p.user?.id || p.guestPlayer?.id)
            .filter((id): id is string => id !== undefined);
          
          // Convertir d'abord les données du serveur en format compatible
          const cricketPlayers = players.map(player => ({
            id: player.id,
            username: player.username,
            scores: player.scores,
            totalPoints: 'currentScore' in player ? player.currentScore : 0
          })) as unknown as CricketPlayerResponse[];
          
          // Mapper les joueurs avec leurs scores
          const mappedPlayers = cricketPlayers.map(player => {
            const scores: Record<string, CricketScoreTarget> = { ...DEFAULT_CRICKET_SCORES };
            
            if (Array.isArray(player.scores)) {
              // Si les scores sont un tableau (Score[]), les convertir en format Cricket
              player.scores.forEach(score => {
                const target = score.points.toString();
                if (scores[target]) {
                  scores[target] = {
                    hits: score.isDouble ? 2 : 1,
                    points: score.points
                  };
                }
              });
            } else {
              // Si les scores sont déjà au format Cricket, les utiliser directement
              Object.entries(player.scores).forEach(([target, score]) => {
                if (scores[target]) {
                  scores[target] = score;
                }
              });
            }
            
            return {
              id: player.id,
              username: player.username,
              scores,
              totalPoints: player.totalPoints || Object.values(scores)
                .reduce((sum, score) => sum + score.points, 0)
            };
          });
          
          // Réorganiser les joueurs selon l'ordre de la session
          const reorderedPlayers = sessionPlayerIds
            .map((id: string) => mappedPlayers.find(p => p.id === id))
            .filter((player): player is CricketPlayerState => player !== undefined);
          
          console.log('Final reordered WebSocket players:', reorderedPlayers);
          
          const cricketState: CricketGameState = {
            players: reorderedPlayers,
            currentPlayerIndex: currentPlayerIndex || 0,
            gameStatus: gameStatus || 'IN_PROGRESS',
            winner: winner
          };
          
          console.log('Final WebSocket cricket state:', cricketState);
          setGameState(cricketState);
          setActivePlayerIndex(currentPlayerIndex || 0);
        }

        if (gameStatus === GameStatus.COMPLETED && winner && typeof winner === 'string') {
          handleEndGame(winner);
        }
      }
    });

    return () => {
      console.log('Cleaning up WebSocket event handlers');
      unsubscribe();
    };
  }, [isConnected, subscribe, session, gameVariant]);

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