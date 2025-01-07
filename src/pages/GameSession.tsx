import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { GameSession, PlayerGame, Score, Game, Player, AddScoreData } from "../types/index";
import { GameType, DartVariant } from "../types/index";
import DartBoard from "../components/molecules/DartBoard";
import { gameService } from "../api/services";
import { XCircleIcon } from '@heroicons/react/24/outline';
import VictoryModal from "../components/molecules/VictoryModal";
import CricketBoard from '../components/CricketBoard';
import { CricketGameState, CricketHit, PlayerCricketScores } from '../types/cricket';

interface ExtendedPlayerGame extends Omit<PlayerGame, 'cricketScores'> {
  player: Player;
  currentScore: number;
  cricketScores?: {
    scores: PlayerCricketScores;
  };
}

interface ExtendedGameSession extends Omit<GameSession, 'players'> {
  players: ExtendedPlayerGame[];
}

interface PlayerScore {
  index: number;
  playerId: string;
  username: string;
  scoresCount: number;
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
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(() => {
    const saved = localStorage.getItem(`activePlayer_${id}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameState, setGameState] = useState<CricketGameState>({
    players: [],
    currentPlayerIndex: 0,
    gameStatus: 'IN_PROGRESS'
  });

  // Sauvegarder l'index du joueur actif dans le localStorage
  useEffect(() => {
    if (id) {
      localStorage.setItem(`activePlayer_${id}`, activePlayerIndex.toString());
    }
  }, [activePlayerIndex, id]);

  // Fetch game session data
  const fetchSession = useCallback(async () => {
    if (!id) return;
    
    try {
      const { data } = await gameService.getSession(id);
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
          setGameState({
            players: extendedSession.players.map(player => ({
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
            })),
            currentPlayerIndex: activePlayerIndex,
            gameStatus: 'IN_PROGRESS'
          });
        }
      }
    } catch (err) {
      setError('Failed to load game session');
    } finally {
      setLoading(false);
    }
  }, [id, activePlayerIndex]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!session?.gameId) return;

    const wsUrl = `ws://localhost:8000/games`;
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      websocket.send(JSON.stringify({
        type: 'join_game',
        gameId: session.gameId,
        playerId: user?.id
      }));
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'score_update' || data.type === 'game_status_update') {
        fetchSession();
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
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
                if (p.id === currentPlayer.id) {
                  return {
                    ...p,
                    scores: [...p.scores, data.score],
                  };
                }
                return p;
              }),
            };
          });

          // Passer au joueur suivant
          const nextPlayerIndex = (activePlayerIndex + 1) % session.players.length;
          setActivePlayerIndex(nextPlayerIndex);
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
              if (p.id === currentPlayer.id) {
                return {
                  ...p,
                  scores: [...p.scores, data.score],
                  currentScore: remainingScore,
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

        // Passer au joueur suivant
        const nextPlayerIndex = (activePlayerIndex + 1) % session.players.length;
        setActivePlayerIndex(nextPlayerIndex);
      }
    } catch (error: any) {
      console.error("Error adding score:", error);
      if (error.response?.data?.message === 'Le dernier lancer doit être un double pour finir la partie') {
        setInfoMessage('💡 Règle du jeu : Pour gagner, vous devez finir sur un double ! Par exemple : double 8 pour 16 points.');
        setTimeout(() => setInfoMessage(''), 5000);
        // On passe au joueur suivant car le joueur n'a pas réussi à finir sur un double
        const nextPlayerIndex = (activePlayerIndex + 1) % session.players.length;
        setActivePlayerIndex(nextPlayerIndex);
      }
    }
  };

  const handleEndGame = async (winnerId: string) => {
    if (!session) return;

    try {
      await gameService.endSession(session.game.id, session.id, winnerId);
      
      // Trouver le joueur gagnant
      const winningPlayer = session.players.find(p => p.playerId === winnerId);
      if (winningPlayer) {
        setWinner({
          username: winningPlayer.player.username,
          id: winnerId
        });
        setShowVictoryModal(true);
      }
      
      ws?.send(JSON.stringify({
        type: 'game_status_update',
        gameId: session.game.id,
        status: 'COMPLETED'
      }));
    } catch (err) {
      console.error("Error ending game:", err);
      setError('Failed to end game');
    }
  };

  const handleCricketScore = async (target: number, multiplier: number) => {
    if (!session) return;

    const currentPlayer = session.players[activePlayerIndex];
    
    try {
      const scoreData = {
        playerId: currentPlayer.playerId,
        target,
        multiplier,
        turnNumber: currentPlayer.scores?.length || 0
      };

      const { data } = await gameService.addCricketScore(session.game.id, session.id, scoreData);

      if (data.cricketScore) {
        setSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map(p => {
              if (p.id === currentPlayer.id) {
                return {
                  ...p,
                  cricketScores: data.cricketScore
                };
              }
              return p;
            }),
          };
        });

        // Update game state
        setGameState(prev => {
          const updatedPlayers = prev.players.map(p => {
            if (p.id === currentPlayer.playerId) {
              return {
                ...p,
                scores: data.cricketScore.scores as PlayerCricketScores,
                totalPoints: Object.values(data.cricketScore.scores as PlayerCricketScores)
                  .reduce((sum, score) => sum + (score.points || 0), 0)
              };
            }
            return p;
          });

          // Check if the current player has won
          const currentPlayerUpdated = updatedPlayers.find(p => p.id === currentPlayer.playerId);
          const otherPlayers = updatedPlayers.filter(p => p.id !== currentPlayer.playerId);
          
          if (currentPlayerUpdated) {
            const hasClosedAllTargets = Object.values(currentPlayerUpdated.scores)
              .every(score => score.hits >= 3);
            const hasHighestPoints = currentPlayerUpdated.totalPoints >= 
              Math.max(...otherPlayers.map(p => p.totalPoints));

            if (hasClosedAllTargets && hasHighestPoints) {
              handleEndGame(currentPlayer.playerId);
              return {
                ...prev,
                players: updatedPlayers,
                gameStatus: 'COMPLETED' as const
              };
            }
          }

          // Move to next player
          const nextPlayerIndex = (activePlayerIndex + 1) % session.players.length;
          setActivePlayerIndex(nextPlayerIndex);

          return {
            ...prev,
            players: updatedPlayers,
            currentPlayerIndex: nextPlayerIndex
          };
        });
      }
    } catch (error) {
      console.error("Error adding cricket score:", error);
      setError('Failed to add score');
    }
  };

  // Mettre à jour le gameState quand la session change
  useEffect(() => {
    if (session && session.game.variant === DartVariant.CRICKET) {
      setGameState({
        players: session.players.map(player => ({
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
        })),
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
  const currentPlayerInGame = session?.players.find(p => p.playerId === user?.id);
  const isCurrentPlayerActive = session?.players[activePlayerIndex]?.playerId === user?.id;

  return (
    <div className="container mx-auto px-4 py-8">
      {showVictoryModal && winner && (
        <VictoryModal
          winner={winner}
          onClose={() => setShowVictoryModal(false)}
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
        <Link
          to="/games"
          className="px-4 py-2 rounded bg-[var(--glass-bg)] text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)]"
        >
          Retour aux jeux
        </Link>
      </div>

      {/* Contenu principal */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tableau des scores */}
          <div className="space-y-4">
            {session.players.map((playerGame: ExtendedPlayerGame, index: number) => (
              <div 
                key={playerGame.id}
                className={`p-4 bg-[var(--glass-bg)] rounded-lg transition-all ${
                  index === activePlayerIndex ? 'ring-2 ring-[var(--neon-primary)]' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--neon-primary)] flex items-center justify-center text-white">
                      {playerGame.player.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-lg font-medium text-[var(--text-primary)]">
                      {playerGame.player.username}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-[var(--neon-primary)]">
                    {playerGame.currentScore}
                  </span>
                </div>

                {/* Statistiques du joueur */}
                <div className="grid grid-cols-3 gap-4 mt-2">
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
                </div>
              </div>
            ))}
          </div>

          {/* Zone de jeu */}
          <div className="flex flex-col items-center">
            {/* Cible de fléchettes */}
            {session.game.gameType === GameType.DARTS && session.game.variant === DartVariant.CRICKET ? (
              <CricketBoard
                gameState={gameState}
                onScore={handleCricketScore}
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