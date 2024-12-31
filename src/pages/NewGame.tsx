import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameService, gameSessionService } from '../api/services';
import { Game } from '../types';

const NewGame: React.FC = () => {
  const navigate = useNavigate();
  const [gameType, setGameType] = useState<'DARTS' | 'BILLIARDS'>('DARTS');
  const [name, setName] = useState('');
  const [maxScore, setMaxScore] = useState(501); // Default for darts
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create the game
      const gameData: Partial<Game> = {
        name,
        game_type: gameType,
        description: `${gameType} game - ${name}`,
        max_score: maxScore,
        min_players: 2,
        max_players: gameType === 'DARTS' ? 4 : 2,
      };

      const { data: game } = await gameService.createGame(gameData);

      // Create a game session
      const { data: session } = await gameSessionService.createSession({
        game: game.id,
        players: [], // Players will be added later
      });

      navigate(`/games/${session.id}/setup`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Create New Game</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Game Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setGameType('DARTS')}
                className={`p-4 rounded-lg border-2 transition-colors duration-200 ${
                  gameType === 'DARTS'
                    ? 'border-primary-500 bg-primary-500/20 text-white'
                    : 'border-secondary-700 hover:border-primary-500/50 text-secondary-400'
                }`}
              >
                <div className="text-lg font-semibold">Darts</div>
                <div className="text-sm mt-1">2-4 Players</div>
              </button>
              <button
                type="button"
                onClick={() => setGameType('BILLIARDS')}
                className={`p-4 rounded-lg border-2 transition-colors duration-200 ${
                  gameType === 'BILLIARDS'
                    ? 'border-primary-500 bg-primary-500/20 text-white'
                    : 'border-secondary-700 hover:border-primary-500/50 text-secondary-400'
                }`}
              >
                <div className="text-lg font-semibold">Billiards</div>
                <div className="text-sm mt-1">2 Players</div>
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-secondary-300 mb-2"
            >
              Game Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter game name"
              required
            />
          </div>

          {gameType === 'DARTS' && (
            <div>
              <label
                htmlFor="maxScore"
                className="block text-sm font-medium text-secondary-300 mb-2"
              >
                Starting Score
              </label>
              <select
                id="maxScore"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="input-field"
              >
                <option value="301">301</option>
                <option value="501">501</option>
                <option value="701">701</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              'Create Game'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewGame; 