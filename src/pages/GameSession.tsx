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

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { io, Socket } from "socket.io-client";
import type { GameSession, PlayerGame, Score, AddScoreData, User } from "../types/index";
import { GameType, DartVariant } from "../types/index";
import DartBoard from "../components/molecules/DartBoard";
import { gameService } from "../api/services";
import { XCircleIcon } from '@heroicons/react/24/outline';
import VictoryModal from "../components/molecules/VictoryModal";
import CricketDartBoard from '../components/molecules/CricketDartBoard';
import { CricketGameState, PlayerCricketScores, CricketThrow, CricketScoreData, CricketGameStats } from '../types/cricket';
import CricketRules from '../components/molecules/CricketRules';

/**
 * Interface étendant PlayerGame pour inclure les données du joueur
 * et les scores spécifiques au Cricket
 */
interface ExtendedPlayerGame extends Omit<PlayerGame, 'cricketScores'> {
  player: User;
  currentScore: number;
  cricketScores?: {
    scores: PlayerCricketScores;
  };
}

interface ExtendedGameSession extends Omit<GameSession, 'players'> {
  players: ExtendedPlayerGame[];
}

interface GameUpdateEvent {
  type: 'score_update' | 'game_status_update';
  gameId: string;
  sessionId: string;
  playerId: string;
  score?: Score;
  cricketScore?: any;
  status?: string;
}

const GameSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<ExtendedGameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string>('');
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [winner, setWinner] = useState<{ username: string; id: string } | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<CricketGameState>({
    players: [],
    currentPlayerIndex: 0,
    gameStatus: 'IN_PROGRESS'
  });
  const [showRules, setShowRules] = useState(false);

  // Fonction utilitaire pour passer au joueur suivant
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

  /**
   * Récupère les données de la session depuis le backend
   */
  const fetchSession = useCallback(async () => {
    if (!id) return;
    
    try {
      const { data } = await gameService.getSession(id);
      console.log('Game data:', data);
      const gameSession = data.sessions?.[data.sessions.length - 1];
      if (gameSession) {
        // Transform the session data to include player and currentScore
        const extendedSession: ExtendedGameSession = {
          ...gameSession,
          game: {
            id: data.id,
            name: data.name,
            description: data.description,
            gameType: data.gameType,
            maxScore: data.maxScore,
            minPlayers: data.minPlayers,
            maxPlayers: data.maxPlayers,
            creatorId: data.creatorId,
            variant: data.variant,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          },
          players: gameSession.players.map((p: any) => ({
            ...p,
            player: {
              id: p.player.id,
              username: p.player.username
            },
            currentScore: data.maxScore - (p.scores?.reduce((sum: number, s: Score) => sum + s.points, 0) || 0)
          }))
        };
        setSession(extendedSession);

        // Si c'est une partie de cricket, initialiser le gameState
        if (data.variant === DartVariant.CRICKET) {
          console.log('Cricket session data:', extendedSession.players);
          const initializedPlayers = extendedSession.players.map(player => {
            console.log('Player cricket scores:', player.cricketScores);
            return {
              id: player.playerId,
              username: player.player.username,
              scores: player.cricketScores?.scores || {
                15: { hits: 0, points: 0 },
                16: { hits: 0, points: 0 },
                17: { hits: 0, points: 0 },
                18: { hits: 0, points: 0 },
                19: { hits: 0, points: 0 },
                20: { hits: 0, points: 0 },
                25: { hits: 0, points: 0 }
              },
              totalPoints: Object.values(player.cricketScores?.scores || {}).reduce((sum, score) => sum + score.points, 0)
            };
          });

          setGameState({
            players: initializedPlayers,
            currentPlayerIndex: activePlayerIndex,
            gameStatus: 'IN_PROGRESS'
          });
        }
      }
    } catch (err) {
      console.error('Error fetching session:', err);
      setError('Failed to load game session');
    } finally {
      setLoading(false);
    }
  }, [id, activePlayerIndex]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!session?.gameId) return;

    let socketUrl: string;
    
    // En production
    if (import.meta.env.PROD) {
      socketUrl = import.meta.env.VITE_API_URL || '';
    } else {
      // En développement
      socketUrl = 'http://localhost:8000';
    }
      
    console.log('Tentative de connexion Socket.IO à:', socketUrl);
    
    const newSocket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connecté avec succès');
      
      // Envoyer les informations de connexion
      newSocket.emit('join_game', {
        gameId: session.game.id,
        playerId: user?.id
      });
    });
    
    newSocket.on('game_update', (data: GameUpdateEvent) => {
      console.log('Mise à jour du jeu reçue:', data);
      fetchSession();
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO déconnecté');
    });

    setSocket(newSocket);
    
    return () => {
      console.log('Nettoyage de la connexion Socket.IO');
      newSocket.disconnect();
    };
  }, [session?.gameId, user?.id, fetchSession]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleScoreSelect = async (score: number, isDouble: boolean) => {
    if (!session) return;

    const currentPlayer = session.players[activePlayerIndex];
    const remainingScore = currentPlayer.currentScore - score;

    // Si le score dépasse, on envoie un score de 0
    if (remainingScore < 0) {
      try {
        const scoreData: AddScoreData = {
          playerId: currentPlayer.playerId,
          points: 0,
          turnNumber: currentPlayer.scores?.length || 0,
          isDouble
        };

        const { data } = await gameService.addScore(session.game.id, session.id, scoreData);

        if (data.score) {
          setSession(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              players: prev.players.map(p => {
                if (p.playerId === currentPlayer.playerId) {
                  return {
                    ...p,
                    scores: [...(p.scores || []), data.score],
                    currentScore: p.currentScore
                  };
                }
                return p;
              }),
            };
          });

          moveToNextPlayer();
        }
      } catch (error) {
        console.error("Error adding score:", error);
      }
      return;
    }

    // Score normal
    try {
      const scoreData: AddScoreData = {
        playerId: currentPlayer.playerId,
        points: score,
        turnNumber: currentPlayer.scores?.length || 0,
        isDouble
      };

      const { data } = await gameService.addScore(session.game.id, session.id, scoreData);

      if (data.score) {
        setSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map(p => {
              if (p.playerId === currentPlayer.playerId) {
                return {
                  ...p,
                  scores: [...(p.scores || []), data.score],
                  currentScore: remainingScore
                };
              }
              return p;
            }),
          };
        });

        // Si le joueur a gagné (score = 0)
        if (remainingScore === 0) {
          handleEndGame(currentPlayer.playerId);
          return;
        }

        moveToNextPlayer();
      }
    } catch (error: any) {
      console.error("Error adding score:", error);
      if (error.response?.data?.message === 'Le dernier lancer doit être un double pour finir la partie') {
        setInfoMessage('💡 Règle du jeu : Pour gagner, vous devez finir sur un double ! Par exemple : double 8 pour 16 points.');
        setTimeout(() => setInfoMessage(''), 5000);
        moveToNextPlayer();
      }
    }
  };

  const handleEndGame = async (winnerId: string) => {
    if (!session) return;

    try {
      // Si c'est une partie de Cricket, on ajoute les statistiques
      if (session.game.variant === DartVariant.CRICKET) {
        const gameStats: CricketGameStats = {
          variant: 'CRICKET',
          duration: Date.now() - new Date(session.createdAt).getTime(),
          winner: {
            id: winnerId,
            closedTargets: Object.values(gameState.players.find(p => p.id === winnerId)?.scores || {})
              .filter(score => score.hits >= 3).length,
            totalPoints: Object.values(gameState.players.find(p => p.id === winnerId)?.scores || {})
              .reduce((sum, score) => sum + (score.points || 0), 0),
            totalHits: Object.values(gameState.players.find(p => p.id === winnerId)?.scores || {})
              .reduce((sum, score) => sum + (score.hits || 0), 0)
          },
          players: gameState.players.map(player => ({
            id: player.id,
            closedTargets: Object.values(player.scores)
              .filter(score => score.hits >= 3).length,
            totalPoints: Object.values(player.scores)
              .reduce((sum, score) => sum + (score.points || 0), 0),
            totalHits: Object.values(player.scores)
              .reduce((sum, score) => sum + (score.hits || 0), 0)
          }))
        };
        await gameService.endSession(session.game.id, session.id, winnerId, gameStats);
      } else {
        await gameService.endSession(session.game.id, session.id, winnerId);
      }
      
      // Trouver le joueur gagnant
      const winningPlayer = session.players.find(p => p.playerId === winnerId);
      if (winningPlayer) {
        setWinner({
          username: winningPlayer.player.username,
          id: winnerId
        });
        setShowVictoryModal(true);
      }
      
      socket?.emit('game_update', {
        type: 'game_status_update',
        gameId: session.game.id,
        status: 'COMPLETED'
      });
    } catch (err) {
      console.error("Error ending game:", err);
      setError('Failed to end game');
    }
  };

  /**
   * Gère l'ajout d'un score en Cricket
   * @param throws - Tableau des lancers de fléchettes
   */
  const handleCricketScore = async (throws: CricketThrow[]) => {
    if (!session) return;

    const currentPlayer = session.players[activePlayerIndex];
    
    try {
      const scoreData: CricketScoreData = {
        playerId: currentPlayer.playerId,
        throws: throws,
        turnNumber: currentPlayer.scores?.length || 0
      };

      console.log('=== GameSession - Envoi des scores au backend ===');
      console.log('Données envoyées:', scoreData);
      const { data } = await gameService.addCricketScore(session.game.id, session.id, scoreData);
      console.log('Réponse du backend:', data);

      if (data.cricketScore) {
        console.log('=== GameSession - Mise à jour du state ===');
        console.log('État actuel:', gameState);
        
        // Mise à jour du gameState avec les scores complets
        setGameState(prev => {
          const updatedPlayers = prev.players.map(p => {
            if (p.id === currentPlayer.playerId) {
              const scores = data.cricketScore.scores as PlayerCricketScores;
              const totalPoints = Object.values(scores).reduce(
                (sum, score) => sum + (score.points || 0),
                0
              );
              
              const newPlayerState = {
                ...p,
                scores,
                totalPoints
              };
              console.log('Nouveau state du joueur:', newPlayerState);
              return newPlayerState;
            }
            return p;
          });

          // Vérification des conditions de victoire
          const scores = data.cricketScore.scores as PlayerCricketScores;
          const allTargetsClosed = Object.values(scores).every(score => score.hits >= 3);
          console.log('Toutes les cibles fermées:', allTargetsClosed);
          
          const currentPlayerTotalPoints = Object.values(scores).reduce(
            (sum, score) => sum + (score.points || 0),
            0
          );
          console.log('Points totaux du joueur:', currentPlayerTotalPoints);
          
          const otherPlayersTotalPoints = updatedPlayers
            .filter(p => p.id !== currentPlayer.playerId)
            .map(p => Object.values(p.scores as PlayerCricketScores)
              .reduce((sum, score) => sum + (score.points || 0), 0)
            );
          console.log('Points des autres joueurs:', otherPlayersTotalPoints);
          
          const hasHighestScore = otherPlayersTotalPoints.every(points => points <= currentPlayerTotalPoints);
          console.log('A le plus haut score:', hasHighestScore);

          if (allTargetsClosed && hasHighestScore) {
            console.log('=== Victoire détectée ===');
            // Trouver le joueur gagnant
            const winningPlayer = session.players.find(p => p.playerId === currentPlayer.playerId);
            if (winningPlayer) {
              setWinner({
                username: winningPlayer.player.username,
                id: currentPlayer.playerId
              });
              setShowVictoryModal(true);

              // Envoyer l'information de victoire au backend
              handleEndGame(currentPlayer.playerId);
            }
            
            return {
              ...prev,
              players: updatedPlayers,
              gameStatus: 'COMPLETED' as const,
              winner: currentPlayer.playerId
            };
          }

          return {
            ...prev,
            players: updatedPlayers,
          };
        });

        // Mise à jour de la session
        setSession(prev => {
          if (!prev) return prev;
          const updatedSession: ExtendedGameSession = {
            ...prev,
            players: prev.players.map(p => {
              if (p.playerId === currentPlayer.playerId) {
                return {
                  ...p,
                  cricketScores: {
                    ...p.cricketScores,
                    scores: data.cricketScore.scores
                  }
                };
              }
              return p;
            }),
            status: gameState.gameStatus,
            winnerId: gameState.winner
          };
          console.log('Session mise à jour:', updatedSession);
          return updatedSession;
        });

        // Gestion de la fin du tour
        if (gameState.gameStatus === 'COMPLETED' && gameState.winner) {
          try {
            await gameService.endSession(session.game.id, session.id, gameState.winner);
            console.log('Session terminée avec succès');
          } catch (error) {
            console.error('Error ending session:', error);
          }
        }

        // Passage au joueur suivant
        moveToNextPlayer();
      }
    } catch (error) {
      console.error("Error adding cricket score:", error);
      setError('Failed to add score');
    }
  };

  const handleTurnComplete = () => {
    // Passer au joueur suivant
    const nextPlayerIndex = (activePlayerIndex + 1) % session!.players.length;
    setActivePlayerIndex(nextPlayerIndex);
  };

  // Mettre à jour le gameState quand la session change
  useEffect(() => {
    if (session && session.game.variant === DartVariant.CRICKET) {
      console.log('Cricket session data:', session.players);
      const defaultScores: PlayerCricketScores = {
        15: { hits: 0, points: 0 },
        16: { hits: 0, points: 0 },
        17: { hits: 0, points: 0 },
        18: { hits: 0, points: 0 },
        19: { hits: 0, points: 0 },
        20: { hits: 0, points: 0 },
        25: { hits: 0, points: 0 }
      };

      const initializedPlayers = session.players.map(player => {
        console.log('Player cricket scores:', player.cricketScores);
        const scores = player.cricketScores?.scores
          ? (typeof player.cricketScores.scores === 'string'
              ? JSON.parse(player.cricketScores.scores)
              : player.cricketScores.scores)
          : defaultScores;

        // Ensure all required targets exist
        const validScores: PlayerCricketScores = {
          ...defaultScores,
          ...scores
        };

        return {
          id: player.playerId,
          username: player.player.username,
          scores: validScores,
          totalPoints: Object.values(validScores).reduce((sum, score) => sum + score.points, 0)
        };
      });

      setGameState({
        players: initializedPlayers,
        currentPlayerIndex: activePlayerIndex,
        gameStatus: 'IN_PROGRESS'
      });
    }
  }, [session, activePlayerIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[var(--neon-primary)]"></div>
      </div>
    );
  }

  if (error || !session || !session.game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-[var(--text-primary)] mb-4">
          {error || "Impossible de charger la session de jeu"}
        </div>
        <Link to="/games" className="text-[var(--neon-primary)] hover:underline">
          Retour aux jeux
        </Link>
      </div>
    );
  }

  const activePlayer = session?.players[activePlayerIndex]?.playerId;

  return (
    <div className="container mx-auto px-4 py-8">
      {showVictoryModal && winner && (
        <VictoryModal
          winner={winner}
          onClose={() => {
            setShowVictoryModal(false);
            navigate('/dashboard');
          }}
        />
      )}

      {/* Message informatif */}
      {infoMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-900 text-[var(--text-primary)] px-6 py-3 rounded-lg shadow-lg border border-[var(--neon-primary)] relative">
            {infoMessage}
            <button
              onClick={() => setInfoMessage('')}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--glass-bg)] border border-[var(--neon-primary)] flex items-center justify-center hover:bg-[var(--glass-bg-hover)]"
            >
              <XCircleIcon className="w-4 h-4 text-[var(--text-primary)]" />
            </button>
          </div>
        </div>
      )}

      {/* Titre de la session */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          {session.game.name}
        </h1>
        <div className="flex gap-4">
          {session.game.variant === DartVariant.CRICKET && (
            <button
              onClick={() => setShowRules(true)}
              className="px-4 py-2 rounded bg-[var(--glass-bg)] text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]"
            >
              Règles du jeu
            </button>
          )}
          <Link
            to="/games"
            className="px-4 py-2 rounded bg-[var(--glass-bg)] text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]"
          >
            Retour aux jeux
          </Link>
        </div>
      </div>

      {/* Modal des règles */}
      {session.game.variant === DartVariant.CRICKET && (
        <CricketRules isOpen={showRules} onClose={() => setShowRules(false)} />
      )}

      {/* Contenu principal */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tableau des scores */}
          <div className="space-y-4">
            {session.players.map((playerGame: ExtendedPlayerGame, index: number) => (
              <div 
                key={playerGame.id}
                className={`relative p-4 bg-[var(--glass-bg)] rounded-lg transition-all ${
                  index === activePlayerIndex ? 'ring-2 ring-[var(--neon-primary)]' : ''
                }`}
              >
                {/* Indicateur de joueur actif */}
                {index === activePlayerIndex && (
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-8 bg-[var(--neon-primary)] rounded-full animate-pulse" />
                )}
                
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                      index === activePlayerIndex ? 'bg-[var(--neon-primary)]' : 'bg-[var(--glass-bg-hover)]'
                    }`}>
                      {playerGame.player.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-lg font-medium text-[var(--text-primary)]">
                      {playerGame.player.username}
                      {index === activePlayerIndex && (
                        <span className="ml-2 text-[var(--neon-primary)]">• Au tour de jouer</span>
                      )}
                    </span>
                  </div>
                  {session.game.variant !== DartVariant.CRICKET && (
                    <span className="text-2xl font-bold text-[var(--neon-primary)]">
                      {playerGame.currentScore}
                    </span>
                  )}
                </div>

                {/* Statistiques du joueur */}
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {session.game.variant === DartVariant.CRICKET ? (
                    <>
                      <div className="text-center">
                        <div className="text-sm text-[var(--text-secondary)]">Zones fermées</div>
                        <div className="text-lg font-medium text-[var(--text-primary)]">
                          {Object.values(playerGame.cricketScores?.scores || {})
                            .filter(score => score.hits >= 3)
                            .length}
                          /7
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-[var(--text-secondary)]">Points</div>
                        <div className="text-lg font-medium text-[var(--text-primary)]">
                          {Object.values(playerGame.cricketScores?.scores || {})
                            .reduce((sum, score) => sum + (score.points || 0), 0)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-[var(--text-secondary)]">Touches</div>
                        <div className="text-lg font-medium text-[var(--text-primary)]">
                          {Object.values(playerGame.cricketScores?.scores || {})
                            .reduce((sum, score) => sum + (score.hits || 0), 0)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <div className="text-sm text-[var(--text-secondary)]">Fléchettes</div>
                        <div className="text-lg font-medium text-[var(--text-primary)]">
                          {(playerGame.scores?.length || 0) * 3}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-[var(--text-secondary)]">Précision</div>
                        <div className="text-lg font-medium text-[var(--text-primary)]">
                          {Math.round(
                            ((playerGame.scores?.filter((s: Score) => s.points > 40).length || 0) /
                            (playerGame.scores?.length || 1)) * 100
                          )}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-[var(--text-secondary)]">Dernier score</div>
                        <div className="text-lg font-medium text-[var(--text-primary)]">
                          {playerGame.scores?.[playerGame.scores.length - 1]?.points || 0}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Zone de jeu */}
          <div className="flex flex-col items-center">
            {/* Cible de fléchettes */}
            {session.game.gameType === GameType.DARTS && session.game.variant === DartVariant.CRICKET ? (
              <CricketDartBoard
                gameState={gameState}
                onScoreClick={handleCricketScore}
                currentPlayerId={activePlayer}
                onTurnComplete={handleTurnComplete}
              />
            ) : (
              <div className="flex items-center justify-center">
                <DartBoard 
                  onScoreSelect={handleScoreSelect}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSession; 