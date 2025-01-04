import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameService } from '../api/services';
import type { GameSession as GameSessionType, Game } from '../types';
import { useAuth } from '../contexts/AuthContext';
import DartBoard from '../components/molecules/DartBoard';
import { XCircleIcon } from '@heroicons/react/24/outline';

interface WebSocketMessage {
  type: 'score_update' | 'game_status_update';
  data?: any;
}

const GameSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<GameSessionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);

  // Fetch game session data
  const fetchSession = useCallback(async () => {
    if (!id) return;
    
    try {
      const { data } = await gameService.getSession(id);
      const gameSession = data.sessions?.[data.sessions.length - 1];
      if (gameSession) {
        setSession(gameSession);
      }
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Failed to load game session');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!id) return;

    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
    const websocket = new WebSocket(`${WS_URL}/games/${id}`);

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data) as WebSocketMessage;
      if (message.type === 'score_update' || message.type === 'game_status_update') {
        fetchSession();
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [id, fetchSession]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleScoreSubmit = async (score: number) => {
    if (!session || !user) return;

    try {
      await gameService.addScore(session.gameId, session.id, {
        playerId: user.id,
        points: score,
        turnNumber: session.players.find(p => p.player.id === user.id)?.scores?.length || 0
      });

      // Send WebSocket update
      ws?.send(JSON.stringify({
        type: 'score_update',
        gameId: session.id,
        playerId: user.id,
        score
      }));

      // Passer au joueur suivant
      setActivePlayerIndex((current) => (current + 1) % session.players.length);
      setSelectedScore(null);
      await fetchSession();
    } catch (err) {
      setError('Failed to update score');
    }
  };

  const handleEndGame = async (winnerId: string) => {
    if (!session) return;

    try {
      await gameService.endSession(session.gameId, session.id, winnerId);
      
      // Send WebSocket update
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
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--neon-primary)] border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="game-card p-8 text-center">
          <div className="text-[var(--neon-accent)]">Session de jeu introuvable</div>
        </div>
      </div>
    );
  }

  const activePlayer = session.players[activePlayerIndex];
  const isCurrentPlayerActive = activePlayer?.player.id === user?.id;

  return (
    <div className="p-4">
      <div className="game-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl text-[var(--text-secondary)] opacity-75">
            {session.game?.name || 'Partie de fléchettes'}
          </h1>
          {session.status === 'IN_PROGRESS' && (
            <button
              onClick={() => session.players[0] && handleEndGame(session.players[0].player.id)}
              className="game-button-option flex items-center hover:text-[var(--neon-accent)]"
            >
              <XCircleIcon className="w-5 h-5 mr-2" />
              Terminer la partie
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tableau des scores */}
          <div className="space-y-4">
            {session.players.map((playerGame, index) => (
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
                    {(session.game?.maxScore || 501) - (playerGame.currentScore || 0)}
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
                        ((playerGame.scores?.filter(s => s.value > 40).length || 0) /
                        (playerGame.scores?.length || 1)) * 100
                      )}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-[var(--text-secondary)]">Dernier score</div>
                    <div className="text-lg font-medium text-[var(--text-primary)]">
                      {playerGame.scores?.[playerGame.scores.length - 1]?.value || 0}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cible de fléchettes */}
          <div className="flex flex-col items-center">
            {!isCurrentPlayerActive && (
              <div className="active-player-indicator text-2xl font-bold mb-6">
                Au tour de {activePlayer?.player.username}
              </div>
            )}
            <DartBoard 
              onScoreSelect={(score) => {
                if (isCurrentPlayerActive) {
                  handleScoreSubmit(score);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSession; 