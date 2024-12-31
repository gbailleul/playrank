import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gameSessionService } from '../api/services';
import { GameSession, User } from '../types';
import { UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const GameSetup: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>([]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await gameSessionService.getSession(Number(id));
        setSession(data);
        // Set any existing players
        setSelectedPlayers(data.players.map(p => p.player));
      } catch (err) {
        setError('Failed to load game session');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSession();
    }
  }, [id]);

  // Mock function for searching users - replace with actual API call
  const searchUsers = async (term: string) => {
    // TODO: Implement actual user search
    const mockUsers: User[] = [
      { id: 1, username: 'player1', email: 'player1@example.com' },
      { id: 2, username: 'player2', email: 'player2@example.com' },
      // Add more mock users as needed
    ];
    return mockUsers.filter(user => 
      user.username.toLowerCase().includes(term.toLowerCase())
    );
  };

  useEffect(() => {
    const search = async () => {
      if (searchTerm.length >= 2) {
        const results = await searchUsers(searchTerm);
        setSearchResults(results.filter(user => 
          !selectedPlayers.some(p => p.id === user.id)
        ));
      } else {
        setSearchResults([]);
      }
    };

    search();
  }, [searchTerm, selectedPlayers]);

  const handleAddPlayer = (player: User) => {
    if (session?.game.max_players && selectedPlayers.length >= session.game.max_players) {
      setError('Maximum number of players reached');
      return;
    }
    setSelectedPlayers([...selectedPlayers, player]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemovePlayer = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const handleStartGame = async () => {
    if (!session) return;

    try {
      if (selectedPlayers.length < session.game.min_players) {
        setError(`Minimum ${session.game.min_players} players required`);
        return;
      }

      // Update session with selected players
      await gameSessionService.createSession({
        game: session.game.id,
        players: selectedPlayers.map(p => p.id),
      });

      // Start the game
      await gameSessionService.startSession(session.id);

      // Navigate to the game page
      navigate(`/games/${session.id}`);
    } catch (err) {
      setError('Failed to start game');
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
        Game session not found
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Game Setup</h1>
      </div>

      <div className="card space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {session.game.name}
          </h2>
          <p className="text-secondary-400">
            {session.game.game_type} - {session.game.min_players} to{' '}
            {session.game.max_players} players
          </p>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-secondary-300"
          >
            Add Players
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pr-10"
              placeholder="Search players..."
            />
            <UserPlusIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-secondary-800 rounded-md shadow-lg">
              <ul className="py-1">
                {searchResults.map((user) => (
                  <li key={user.id}>
                    <button
                      onClick={() => handleAddPlayer(user)}
                      className="w-full px-4 py-2 text-left hover:bg-secondary-700 text-white"
                    >
                      {user.username}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Selected Players */}
        <div>
          <h3 className="text-sm font-medium text-secondary-300 mb-3">
            Selected Players ({selectedPlayers.length}/{session.game.max_players})
          </h3>
          <div className="space-y-2">
            {selectedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-secondary-700 rounded-lg p-3"
              >
                <div className="flex items-center">
                  <img
                    src={player.avatar_url || 'https://via.placeholder.com/32'}
                    alt={player.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="ml-3 text-white">{player.username}</span>
                </div>
                <button
                  onClick={() => handleRemovePlayer(player.id)}
                  className="text-secondary-400 hover:text-white"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleStartGame}
            className="btn-primary"
            disabled={selectedPlayers.length < session.game.min_players}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup; 