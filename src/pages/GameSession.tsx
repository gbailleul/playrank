import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameSessionService } from '../api/services';
import type { GameSession } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface WebSocketMessage {
  type: 'score_update' | 'game_status_update';
  data?: any;
}

const GameSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Fetch game session data
  const fetchSession = useCallback(async () => {
    if (!id) return;
    
    try {
      const { data } = await gameSessionService.getSession(id);
      setSession(data);
      if (data.game.gameType === 'DARTS') {
        setCurrentScore(data.game.maxScore);
      }
    } catch (err) {
      setError('Failed to load game session');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!id) return;

    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
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

  const handleScoreSubmit = async (points: number) => {
    if (!session || !user) return;

    try {
      await gameSessionService.addScore(session.id, {
        player_id: user.id,
        points,
        turn_number: currentTurn
      });

      // Send WebSocket update
      ws?.send(JSON.stringify({
        type: 'score_update',
        game_id: session.id,
        player_id: user.id,
        score: points
      }));

      setCurrentTurn(prev => prev + 1);
      await fetchSession();
    } catch (err) {
      setError('Failed to update score');
    }
  };

  const handleEndGame = async (winnerId: string) => {
    if (!session) return;

    try {
      await gameSessionService.endSession(session.id, winnerId);
      
      // Send WebSocket update
      ws?.send(JSON.stringify({
        type: 'game_status_update',
        game_id: session.id,
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

  const isDarts = session.game.gameType === 'DARTS';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="game-card">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="game-title text-2xl">{session.game.name}</h1>
            <p className="text-[var(--text-secondary)]">
              {session.game.gameType} - {session.status}
            </p>
          </div>
          {session.status === 'IN_PROGRESS' && (
            <button
              onClick={() => session.players[0] && handleEndGame(session.players[0].player.id)}
              className="game-button-secondary flex items-center"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scoreboard */}
          <div className="game-card">
            <h2 className="game-title text-xl mb-4">Tableau des scores</h2>
            <div className="space-y-4">
              {session.players.map((playerSession) => (
                <div
                  key={playerSession.id}
                  className={`game-card ${playerSession.player.id === user?.id ? 'border-[var(--neon-primary)]' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full border border-[var(--neon-primary)] flex items-center justify-center bg-[var(--glass-bg)]">
                        {playerSession.player.username[0]}
                      </div>
                      <span className="ml-3 font-medium">
                        {playerSession.player.username}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-[var(--neon-primary)]">
                      {isDarts
                        ? session.game.maxScore - playerSession.currentScore
                        : playerSession.currentScore}
                    </div>
                  </div>

                  {session.status === 'IN_PROGRESS' &&
                    user?.id === playerSession.player.id && (
                      <div className="mt-4">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={currentScore}
                            onChange={(e) =>
                              setCurrentScore(Math.max(0, parseInt(e.target.value) || 0))
                            }
                            className="game-input w-24"
                            min="0"
                            max={isDarts ? session.game.maxScore : undefined}
                          />
                          <button
                            onClick={() => handleScoreSubmit(currentScore)}
                            className="game-button"
                          >
                            Submit Score
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Moves */}
          <div className="game-card">
            <h2 className="game-title text-xl mb-4">Derniers coups</h2>
            <div className="space-y-3">
              {session.players
                .flatMap(p => p.scores || [])
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 10)
                .map((score) => (
                  <div
                    key={score.id}
                    className="game-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full border border-[var(--neon-primary)] flex items-center justify-center bg-[var(--glass-bg)]">
                          {score.playerGame.player.username[0]}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">
                            {score.playerGame.player.username}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            Tour {score.turnNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-[var(--neon-primary)]">
                        {isDarts ? '-' : '+'}{score.value}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSession; 