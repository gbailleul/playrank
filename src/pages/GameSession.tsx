import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameSessionService, createWebSocket } from '../api/services';
import type { GameSession, PlayerGameSession, Score } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  TrophyIcon,
  ArrowPathIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

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
    try {
      const { data } = await gameSessionService.getSession(Number(id));
      setSession(data);
      if (data.game.game_type === 'DARTS') {
        setCurrentScore(data.game.max_score);
      }
    } catch (err) {
      setError('Failed to load game session');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (id) {
      const websocket = createWebSocket(Number(id));
      setWs(websocket);

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'score_update') {
          fetchSession();
        } else if (data.type === 'game_status_update') {
          fetchSession();
        }
      };

      return () => {
        websocket.close();
      };
    }
  }, [id, fetchSession]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleScoreSubmit = async (playerSession: PlayerGameSession, points: number) => {
    try {
      await gameSessionService.addScore(session!.id, {
        player_id: playerSession.player.id,
        points,
        notes: `Turn ${currentTurn}`,
      });

      // Send WebSocket update
      ws?.send(JSON.stringify({
        type: 'score_update',
        player_id: playerSession.player.id,
        score: points,
        turn_number: currentTurn,
      }));

      setCurrentTurn(prev => prev + 1);
      await fetchSession();
    } catch (err) {
      setError('Failed to update score');
    }
  };

  const handleEndGame = async (winnerId: number) => {
    try {
      await gameSessionService.endSession(session!.id, winnerId);
      
      // Send WebSocket update
      ws?.send(JSON.stringify({
        type: 'game_status_update',
        status: 'COMPLETED',
      }));

      navigate('/');
    } catch (err) {
      setError('Failed to end game');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center text-red-500">
        Session de jeu introuvable
      </div>
    );
  }

  const isDarts = session.game.game_type === 'DARTS';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{session.game.name}</h1>
          <p className="text-secondary-400">
            {session.game.game_type} - {session.status}
          </p>
        </div>
        {session.status === 'IN_PROGRESS' && (
          <button
            onClick={() => handleEndGame(session.players[0].player.id)}
            className="btn-secondary flex items-center"
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
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Tableau des scores</h2>
          <div className="space-y-4">
            {session.players.map((playerSession) => (
              <div
                key={playerSession.id}
                className="bg-secondary-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <img
                      src={playerSession.player.avatar_url || 'https://via.placeholder.com/40'}
                      alt={playerSession.player.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="ml-3 font-medium text-white">
                      {playerSession.player.username}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-primary-500">
                    {isDarts
                      ? session.game.max_score - playerSession.current_score
                      : playerSession.current_score}
                  </div>
                </div>

                {session.status === 'IN_PROGRESS' &&
                  user?.id === playerSession.player.id && (
                    <div className="mt-4">
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={currentScore}
                          onChange={(e) =>
                            setCurrentScore(Math.max(0, parseInt(e.target.value) || 0))
                          }
                          className="input-field w-24"
                          min="0"
                          max={isDarts ? session.game.max_score : undefined}
                        />
                        <button
                          onClick={() => handleScoreSubmit(playerSession, currentScore)}
                          className="btn-primary"
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
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Derniers coups</h2>
          <div className="space-y-3">
            {session.players
              .flatMap((p) => (p as any).scores || [])
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 10)
              .map((score: Score) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between bg-secondary-700 p-3 rounded-lg"
                >
                  <div className="flex items-center">
                    <img
                      src={score.player_session.player.avatar_url || 'https://via.placeholder.com/32'}
                      alt={score.player_session.player.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">
                        {score.player_session.player.username}
                      </p>
                      <p className="text-xs text-secondary-400">
                        Tour {score.turn_number}
                      </p>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-primary-500">
                    {isDarts ? '-' : '+'}{score.points}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSession; 