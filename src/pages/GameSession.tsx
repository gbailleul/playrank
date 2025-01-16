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
import type { GameSession, PlayerGame, Score, AddScoreData, User, Game } from "../types/index";
import { GameType, DartVariant, GameStatus } from "../types/game";
import type { CricketGameState, CricketThrow, CricketScoreData, CricketGameStats, PlayerCricketScores } from '../types/cricket';
import DartBoard from "../components/molecules/DartBoard";
import { gameService } from "../api/services";
import VictoryModal from "../components/molecules/VictoryModal";
import CricketDartBoard from '../components/molecules/CricketDartBoard';

interface CricketScoreTarget {
  hits: number;
  points: number;
}

interface GameWithSessions extends Game {
  sessions: GameSession[];
}

interface ExtendedPlayerGame extends PlayerGame {
  user: User;
  scores: Score[];
  cricketScores?: {
    scores: Record<string, CricketScoreTarget>;
  };
}

interface ExtendedGameSession extends Omit<GameSession, 'players'> {
  game: Game;
  players: Array<PlayerGame & {
    user: {
      id: string;
      username: string;
    };
    scores: Score[];
    cricketScores?: {
      scores: Record<string, CricketScoreTarget>;
    };
    currentScore?: number;
  }>;
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

interface ApiResponse<T> {
  data: T;
}

interface ScoreResponse {
  score: Score;
}

interface CricketScoreResponse {
  cricketScore: {
    scores: Record<string, CricketScoreTarget>;
  };
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
    gameStatus: GameStatus.IN_PROGRESS
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
      const response = await gameService.getGame(id);
      const data = response.data as GameWithSessions;
      console.log('Game data:', data);
      const gameSession = data.sessions?.[data.sessions.length - 1];
      if (data && gameSession) {
        // Trouver l'index du joueur actif en fonction du nombre de scores
        const playerScoreCounts = gameSession.players.map(p => p.scores?.length || 0);
        const minScores = Math.min(...playerScoreCounts);
        const activePlayerIdx = playerScoreCounts.findIndex(count => count === minScores);
        
        const extendedSession: ExtendedGameSession = {
          id: gameSession.id,
          gameId: data.id,
          status: gameSession.status,
          createdAt: gameSession.createdAt,
          updatedAt: gameSession.updatedAt,
          game: {
            id: data.id,
            name: data.name,
            gameType: data.gameType,
            description: data.description,
            maxScore: data.maxScore,
            minPlayers: data.minPlayers,
            maxPlayers: data.maxPlayers,
            creatorId: data.creatorId,
            variant: data.variant,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          },
          players: gameSession.players.map((p: ExtendedPlayerGame) => ({
            ...p,
            player: {
              id: p.user.id,
              username: p.user.username
            },
            currentScore: data.maxScore - (p.scores?.reduce((sum: number, s: Score) => sum + s.points, 0) || 0)
          }))
        };
        setSession(extendedSession);
        setActivePlayerIndex(activePlayerIdx);

        // Si c'est une partie de cricket, initialiser le gameState
        if (data.variant === DartVariant.CRICKET) {
          console.log('Cricket session data:', extendedSession.players);
          const defaultScores: Record<string, CricketScoreTarget> = {
            '15': { hits: 0, points: 0 },
            '16': { hits: 0, points: 0 },
            '17': { hits: 0, points: 0 },
            '18': { hits: 0, points: 0 },
            '19': { hits: 0, points: 0 },
            '20': { hits: 0, points: 0 },
            '25': { hits: 0, points: 0 }
          };

          const initializedPlayers = extendedSession.players.map(player => {
            console.log('Initializing Cricket player:', {
              userId: player.user.id,
              scores: player.cricketScores
            });

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

            const totalPoints = Object.values(validScores).reduce(
              (sum, score) => sum + (score.points || 0),
              0
            );

            return {
              id: player.user.id,  // Utiliser l'ID de l'utilisateur
              username: player.user.username,
              scores: validScores,
              totalPoints
            };
          });

          console.log('Setting initial Cricket game state:', {
            players: initializedPlayers,
            currentPlayerIndex: activePlayerIdx
          });

          setGameState({
            players: initializedPlayers,
            currentPlayerIndex: activePlayerIdx,
            gameStatus: GameStatus.IN_PROGRESS
          });
        }
      }
    } catch (err) {
      console.error('Error fetching session:', err);
      setError('Failed to load game session');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!session?.gameId) return;

    const baseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:8000';
    
    console.log('Tentative de connexion Socket.IO à:', baseUrl);
    
    const newSocket = io(baseUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connecté avec succès');
      newSocket.emit('join_game', {
        gameId: session.game.id,
        playerId: user?.id
      });
    });

    newSocket.on('game_update', (data: GameUpdateEvent) => {
      console.log('Mise à jour du jeu reçue:', data);
      if (data.type === 'score_update' && session) {
        // Mise à jour pour le Cricket
        if (data.cricketScore && session.game.variant === DartVariant.CRICKET) {
          console.log('Mise à jour des scores Cricket reçue:', data.cricketScore);
          
          // Mise à jour du gameState
          setGameState(prev => {
            const updatedPlayers = prev.players.map(p => {
              if (p.id === data.playerId) {
                const scores = data.cricketScore.scores as PlayerCricketScores;
                const totalPoints = Object.values(scores).reduce(
                  (sum, score) => sum + (score.points || 0),
                  0
                );
                console.log('Mise à jour du joueur:', {
                  id: p.id,
                  newScores: scores,
                  totalPoints
                });
                return {
                  ...p,
                  scores,
                  totalPoints
                };
              }
              return p;
            });

            console.log('Joueurs mis à jour:', updatedPlayers);
            return {
              ...prev,
              players: updatedPlayers
            };
          });

          // Mise à jour de la session
          setSession(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              players: prev.players.map(p => {
                if (p.user.id === data.playerId) {
                  return {
                    ...p,
                    cricketScores: {
                      scores: data.cricketScore.scores as Record<string, CricketScoreTarget>
                    }
                  };
                }
                return p;
              })
            };
          });

          // Passage au joueur suivant
          moveToNextPlayer();
        }
        // Gestion des autres variantes (301/501)
        else if (data.score) {
          console.log('Mise à jour du score 501:', {
            playerId: data.playerId,
            score: data.score,
            currentPlayerIndex: activePlayerIndex
          });

          setSession(prev => {
            if (!prev) return prev;
            const updatedPlayers = prev.players.map(p => {
              if (p.user.id === data.playerId && data.score) {
                const newScore = p.currentScore - data.score.points;
                return {
                  ...p,
                  scores: [...p.scores, data.score],
                  currentScore: newScore
                };
              }
              return p;
            });

            // Trouver le joueur qui vient de jouer
            const playerIndex = updatedPlayers.findIndex(p => p.user.id === data.playerId);
            const newScore = updatedPlayers[playerIndex].currentScore;

            // Si ce n'est pas un score gagnant, passer au joueur suivant
            if (newScore !== 0) {
              const nextPlayerIndex = (playerIndex + 1) % updatedPlayers.length;
              console.log('Passage au joueur suivant:', {
                currentIndex: playerIndex,
                nextIndex: nextPlayerIndex
              });
              setActivePlayerIndex(nextPlayerIndex);
            } else {
              console.log('Score gagnant - pas de changement de joueur');
            }

            return {
              ...prev,
              players: updatedPlayers
            };
          });
        }
      }
    });

    setSocket(newSocket);
    
    return () => {
      console.log('Nettoyage de la connexion Socket.IO');
      newSocket.disconnect();
    };
  }, [session?.gameId, user?.id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleScoreSelect = async (score: number, isDouble: boolean) => {
    if (!session) return;

    const currentPlayer = session.players[activePlayerIndex];
    const remainingScore = currentPlayer.currentScore - score;

    if (remainingScore < 0) {
      setInfoMessage('💡 Score trop élevé ! Le score ne peut pas être négatif.');
      setTimeout(() => setInfoMessage(''), 5000);
      return;
    }

    try {
      const scoreData: AddScoreData = {
        playerId: currentPlayer.user.id,
        points: score,
        turnNumber: currentPlayer.scores?.length || 0,
        isDouble
      };

      await gameService.addScore(session.game.id, session.id, scoreData);

      // Le changement de joueur est maintenant géré uniquement dans l'événement socket
      if (remainingScore === 0) {
        handleEndGame(currentPlayer.user.id);
      }
    } catch (error: any) {
      console.error("Error adding score:", error);
      if (error.response?.data?.message === 'Le dernier lancer doit être un double pour finir la partie') {
        setInfoMessage('💡 Règle du jeu : Pour gagner, vous devez finir sur un double ! Par exemple : double 8 pour 16 points.');
        setTimeout(() => setInfoMessage(''), 5000);
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
      const winningPlayer = session.players.find(p => p.user.id === winnerId);
      if (winningPlayer) {
        setWinner({
          username: winningPlayer.user.username,
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
        playerId: currentPlayer.user.id,
        throws: throws,
        turnNumber: currentPlayer.scores?.length || 0
      };

      console.log('=== GameSession - Envoi des scores au backend ===');
      console.log('Données envoyées:', scoreData);
      const { data } = await gameService.addCricketScore(session.game.id, session.id, scoreData) as ApiResponse<CricketScoreResponse>;
      console.log('Réponse du backend:', data);

      if (data.cricketScore) {
        console.log('=== GameSession - Mise à jour du state ===');
        console.log('État actuel:', gameState);
        
        // Mise à jour du gameState avec les scores complets
        const scores = data.cricketScore.scores as PlayerCricketScores;
        const totalPoints = Object.values(scores).reduce(
          (sum, score) => sum + (score.points || 0),
          0
        );

        console.log('Mise à jour des scores Cricket:', {
          playerId: currentPlayer.user.id,
          scores,
          totalPoints
        });

        // Mise à jour immédiate du state
        setGameState(prev => {
          const updatedPlayers = prev.players.map(p => {
            if (p.id === currentPlayer.user.id) {
              return {
                ...p,
                scores,
                totalPoints
              };
            }
            return p;
          });

          console.log('Nouveau state des joueurs:', updatedPlayers);
          return {
            ...prev,
            players: updatedPlayers
          };
        });

        // Mise à jour de la session
        setSession(prev => {
          if (!prev) return prev;
          const updatedPlayers = prev.players.map(p => {
            if (p.user.id === currentPlayer.user.id) {
              return {
                ...p,
                cricketScores: {
                  scores: data.cricketScore.scores as Record<string, CricketScoreTarget>
                }
              };
            }
            return p;
          });

          console.log('Session mise à jour avec les joueurs:', updatedPlayers);
          return {
            ...prev,
            players: updatedPlayers
          };
        });

        // Vérification des conditions de victoire
        const allTargetsClosed = Object.values(scores).every(score => score.hits >= 3);
        const otherPlayersTotalPoints = gameState.players
          .filter(p => p.id !== currentPlayer.user.id)
          .map(p => Object.values(p.scores)
            .reduce((sum, score) => sum + (score.points || 0), 0)
          );
        
        const hasHighestScore = otherPlayersTotalPoints.every(points => points <= totalPoints);

        if (allTargetsClosed && hasHighestScore) {
          console.log('=== Victoire détectée ===');
          const winningPlayer = session.players.find(p => p.user.id === currentPlayer.user.id);
          if (winningPlayer) {
            setWinner({
              username: winningPlayer.user.username,
              id: currentPlayer.user.id
            });
            setShowVictoryModal(true);
            handleEndGame(currentPlayer.user.id);
          }

          setGameState(prev => ({
            ...prev,
            gameStatus: GameStatus.COMPLETED,
            winner: currentPlayer.user.id
          }));
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
    // Cette fonction ne sera utilisée que pour le Cricket
    if (session?.game.variant === DartVariant.CRICKET) {
      const nextPlayerIndex = (activePlayerIndex + 1) % session.players.length;
      setActivePlayerIndex(nextPlayerIndex);
    }
  };

  // Mettre à jour le gameState quand la session change
  useEffect(() => {
    if (session && session.game.variant === DartVariant.CRICKET) {
      console.log('Cricket session data:', session.players);
      const defaultScores: Record<string, CricketScoreTarget> = {
        '15': { hits: 0, points: 0 },
        '16': { hits: 0, points: 0 },
        '17': { hits: 0, points: 0 },
        '18': { hits: 0, points: 0 },
        '19': { hits: 0, points: 0 },
        '20': { hits: 0, points: 0 },
        '25': { hits: 0, points: 0 }
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

        const totalPoints = Object.values(validScores).reduce(
          (sum, score) => sum + (score.points || 0),
          0
        );

        console.log('Initializing player:', {
          id: player.user.id,
          scores: validScores,
          totalPoints
        });

        return {
          id: player.user.id,
          username: player.user.username,
          scores: validScores,
          totalPoints
        };
      });

      console.log('Setting initial game state with players:', initializedPlayers);
      setGameState({
        players: initializedPlayers,
        currentPlayerIndex: activePlayerIndex,
        gameStatus: GameStatus.IN_PROGRESS
      });
    }
  }, [session, activePlayerIndex]);

  const calculateTotalPoints = (scores: CricketScoreTarget[]): number => {
    return scores.reduce((sum: number, score: CricketScoreTarget) => sum + score.points, 0);
  };

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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
      {showVictoryModal && winner && (
        <VictoryModal
          winner={winner}
          onClose={() => {
            setShowVictoryModal(false);
            navigate('/dashboard');
          }}
        />
      )}

      <div className="bg-[var(--glass-bg)] rounded-lg shadow-xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4 sm:mb-0">
            {session.game.name}
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {infoMessage && (
              <div className="text-sm text-[var(--text-primary)] bg-[var(--neon-primary)]/10 px-4 py-2 rounded-lg">
                {infoMessage}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Scores</h2>
            <div className="bg-[var(--glass-bg)] rounded-lg p-4">
              <div className="space-y-4">
                {session.players.map((player, index) => {
                  const isCurrentPlayer = index === activePlayerIndex;
                  const isCricket = session.game.variant === DartVariant.CRICKET;
                  
                  // Pour le Cricket, on récupère les scores depuis le gameState
                  const cricketPlayer = isCricket 
                    ? gameState.players.find(p => p.id === player.user.id)
                    : null;

                  return (
                    <div
                      key={player.user.id}
                      className={`p-4 rounded-lg transition-all ${
                        isCurrentPlayer
                          ? 'bg-[var(--neon-primary)]/10 border border-[var(--neon-primary)] shadow-lg'
                          : 'bg-[var(--glass-bg-lighter)]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {isCurrentPlayer && (
                              <div className="absolute -left-2 -top-2">
                                <span className="text-[var(--neon-primary)]">🎯</span>
                              </div>
                            )}
                            <span className="text-lg font-medium text-[var(--text-primary)]">
                              {player.user.username}
                            </span>
                          </div>
                        </div>
                        {isCricket ? (
                          <div className="text-right">
                            <span className="text-2xl font-bold text-[var(--text-primary)]">
                              {cricketPlayer?.totalPoints || 0}
                            </span>
                            <div className="text-sm text-[var(--text-primary)]/70">
                              {Object.values(cricketPlayer?.scores || {}).filter(s => s.hits >= 3).length} cibles fermées
                            </div>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-[var(--text-primary)]">
                            {player.currentScore}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Zone de jeu */}
          <div className="flex flex-col items-center">
            {/* Cible de fléchettes */}
            {session.game.gameType === GameType.DARTS && session.game.variant === DartVariant.CRICKET ? (
              <CricketDartBoard
                gameState={gameState}
                onScoreClick={handleCricketScore}
                currentPlayerId={session.players[activePlayerIndex].user.id}
                onTurnComplete={handleTurnComplete}
              />
            ) : (
              <div className="w-full max-w-md mx-auto">
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