import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gameService } from '../api/services';
import type { User } from '../types/index';
import type { Game, GameSession } from '../types/base/game';
import type { PlayerGame } from '../types/base/player';
import { UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { GameStatus, GameType, DartVariant } from '../types/game';

interface GameData {
  id: string;
  name: string;
  description: string;
  gameType: GameType;
  maxScore: number;
  minPlayers: number;
  maxPlayers: number;
  creatorId: string;
  variant: DartVariant;
  createdAt: string;
  updatedAt: string;
  sessions?: Array<{
    id: string;
    players: PlayerGame[];
  }>;
}

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
        if (!id) return;
        const { data } = await gameService.getSession(id, 'default-session');
        const gameData = data as unknown as GameData;
        
        // Créer un objet Game à partir des données
        const game: Game = {
          id: gameData.id,
          name: gameData.name,
          description: gameData.description,
          gameType: gameData.gameType,
          maxScore: gameData.maxScore,
          minPlayers: gameData.minPlayers,
          maxPlayers: gameData.maxPlayers,
          creatorId: gameData.creatorId,
          variant: gameData.variant,
          createdAt: new Date(gameData.createdAt),
          updatedAt: new Date(gameData.updatedAt)
        };

        // Créer la session avec le jeu
        const gameSession: GameSession = {
          id: gameData.id,
          gameId: gameData.id,
          game,
          players: gameData.sessions?.[0]?.players || [],
          status: GameStatus.IN_PROGRESS,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        setSession(gameSession);
        
        // Convertir les joueurs en utilisateurs
        const players = gameData.sessions?.[0]?.players || [];
        setSelectedPlayers(players.map((p: PlayerGame) => ({
          id: p.playerId,
          username: p.playerId,
          email: '',
          firstName: '',
          lastName: '',
          role: 'PLAYER' as const,
          status: 'ACTIVE' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        })));
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
      { id: '1', username: 'player1', email: 'player1@example.com', firstName: '', lastName: '', role: 'PLAYER', status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', username: 'player2', email: 'player2@example.com', firstName: '', lastName: '', role: 'PLAYER', status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() },
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
    if (session?.game.maxPlayers && selectedPlayers.length >= session.game.maxPlayers) {
      setError('Maximum number of players reached');
      return;
    }
    setSelectedPlayers([...selectedPlayers, player]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) return;
    
    try {
      const response = await gameService.createGame({
        name: session.game.name,
        description: session.game.description,
        gameType: GameType.DARTS,
        maxScore: session.game.maxScore,
        minPlayers: session.game.minPlayers,
        maxPlayers: session.game.maxPlayers,
        variant: session.game.variant,
        players: selectedPlayers.map(p => ({ id: p.id }))
      });

      // Create session with selected players
      await gameService.createGameSession(
        response.data.game.id,
        { players: selectedPlayers.map(p => ({ id: p.id })) }
      );

      navigate(`/games/${response.data.game.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Configuration de la partie</h1>
      </div>

      <div className="card space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {session.game.name}
          </h2>
          <p className="text-secondary-400">
            {session.game.gameType} - {session.game.minPlayers} to{' '}
            {session.game.maxPlayers} players
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
            Selected Players ({selectedPlayers.length}/{session.game.maxPlayers})
          </h3>
          <div className="space-y-2">
            {selectedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-secondary-700 rounded-lg p-3"
              >
                <div className="flex items-center">
                  <img
                    src={player.avatarUrl || 'https://via.placeholder.com/32'}
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
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={selectedPlayers.length < session.game.minPlayers}
          >
            Commencer la partie
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup; 