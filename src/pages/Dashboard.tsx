import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gameService } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import type { Game } from '../types';

const Dashboard = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data } = await gameService.getAllGames();
        setGames(data);
      } catch (err) {
        setError('Failed to fetch games');
        console.error('Error fetching games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-[var(--error)] p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Welcome{user ? `, ${user.firstName}` : ''}!
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Track your game scores and compete with friends
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link
          to="/games/new"
          className="game-card p-6 flex flex-col items-center justify-center text-center hover:border-[var(--accent-blue)] transition-colors"
        >
          <div className="text-4xl mb-4">🎮</div>
          <h3 className="text-lg font-semibold mb-2">Start New Game</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Create a new game session and invite players
          </p>
        </Link>

        <Link
          to="/leaderboard"
          className="game-card p-6 flex flex-col items-center justify-center text-center hover:border-[var(--accent-purple)] transition-colors"
        >
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold mb-2">View Leaderboard</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Check the rankings and compete for the top spot
          </p>
        </Link>
      </div>

      {/* Recent Games */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Games</h2>
          <Link
            to="/games/new"
            className="btn-primary"
          >
            Create Game
          </Link>
        </div>
        
        {games.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="game-card p-4 hover:border-[var(--accent-blue)] transition-colors"
              >
                <h3 className="font-semibold mb-2">{game.name}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  {game.description}
                </p>
                <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
                  <span>{game.gameType}</span>
                  <span>{new Date(game.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="game-card p-8 text-center">
            <div className="text-4xl mb-4">🎲</div>
            <h3 className="text-xl font-semibold mb-2">No Games Yet</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Get started by creating your first game session!
            </p>
            <Link
              to="/games/new"
              className="btn-primary inline-flex items-center"
            >
              <span className="mr-2">Create Your First Game</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 