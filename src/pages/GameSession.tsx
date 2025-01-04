import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { GameSession, PlayerGame, Score, Game } from "../types/index";
import { GameType } from "../types/index";
import DartBoard from "../components/molecules/DartBoard";
import { gameService } from "../api/services";
import { XCircleIcon } from '@heroicons/react/24/outline';

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
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);

  // Fetch game session data
  const fetchSession = useCallback(async () => {
    if (!id) return;
    
    try {
      const { data } = await gameService.getSession(id);
      const gameSession = data.sessions?.[data.sessions.length - 1];
      if (gameSession) {
        // Ajouter la référence au jeu dans la session
        const sessionWithGame = {
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
          }
        };
        setSession(sessionWithGame);

        // Déterminer l'ordre initial des joueurs si aucun score n'existe
        if (sessionWithGame.players.every((p: PlayerGame) => !p.scores?.length)) {
          setActivePlayerIndex(0);
          return;
        }

        // Trouver le dernier joueur qui a joué
        const playerScores = sessionWithGame.players.map((p: PlayerGame, index: number) => ({
          index,
          playerId: p.player.id,
          username: p.player.username,
          scoresCount: p.scores?.length || 0
        }));

        // Trier par nombre de scores (décroissant)
        playerScores.sort((a: PlayerScore, b: PlayerScore) => b.scoresCount - a.scoresCount);

        // Le joueur avec le moins de scores doit jouer
        const minScores = Math.min(...playerScores.map((p: PlayerGame) => p.scores?.length || 0));
        const nextPlayerIndex = sessionWithGame.players.findIndex(
          (p: PlayerGame) => (p.scores?.length || 0) === minScores
        );

        setActivePlayerIndex(nextPlayerIndex);
      }
    } catch (err) {
      setError('Failed to load game session');
    } finally {
      setLoading(false);
    }
  }, [id]);

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

  const handleScoreSelect = async (score: number) => {
    if (!session) return;

    try {
      const { data } = await gameService.addScore(session.gameId, session.id, {
        playerId: session.players[activePlayerIndex].player.id,
        points: -score,
        turnNumber: session.players[activePlayerIndex].scores?.length || 0
      });

      if (data.score) {
        setSession((prev: GameSession | null) => {
          if (!prev) return prev;
          return {
            ...prev,
            players: prev.players.map((p: PlayerGame) => {
              if (p.id === session.players[activePlayerIndex].id) {
                return {
                  ...p,
                  scores: [...p.scores, data.score],
                  currentScore: p.currentScore - score,
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
  };

  const handleEndGame = async (winnerId: string) => {
    if (!session) return;

    try {
      await gameService.endSession(session.gameId, session.id, winnerId);
      
      ws?.send(JSON.stringify({
        type: 'game_status_update',
        gameId: session.id,
        status: 'COMPLETED'
      }));

      navigate('/');
    } catch (err) {
      setError('Failed to end game');
    }
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

  const activePlayer = session.players[activePlayerIndex];
  const currentPlayerInGame = session.players.find(p => p.player.id === user?.id);
  const isCurrentPlayerActive = session?.players[activePlayerIndex]?.player.id === user?.id;

  return (
    <div className="container mx-auto px-4 py-8">
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
            {session.players.map((playerGame: PlayerGame, index: number) => (
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

          {/* Cible de fléchettes */}
          {session.game.gameType === 'DARTS' && (
            <div className="flex flex-col items-center">
              {!isCurrentPlayerActive && (
                <div className="active-player-indicator text-2xl font-bold mb-6">
                  Au tour de {activePlayer?.player.username}
                </div>
              )}
              <DartBoard 
                onScoreSelect={handleScoreSelect}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameSession; 