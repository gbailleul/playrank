import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateGameDto, User } from '../types';
import { gameService, auth } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import DartBoard from '../components/atoms/DartBoard';

const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<CreateGameDto>({
    name: '',
    description: '',
    gameType: 'DARTS',
    maxScore: 501,
    minPlayers: 2,
    maxPlayers: 4,
  });
  const [error, setError] = useState<string | null>(null);
  const [allPlayers, setAllPlayers] = useState<User[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Calculer le nombre total de joueurs (incluant le créateur)
  const totalPlayers = selectedPlayers.length + 1;

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data } = await auth.getAllPlayers();
        // Filter out current user and inactive/banned users
        const availablePlayers = data.filter(
          player => 
            player.id !== currentUser?.id && 
            player.status === 'ACTIVE' &&
            player.role === 'PLAYER'
        );
        setAllPlayers(availablePlayers);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError('Échec de la chargement des joueurs');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [currentUser?.id]);

  const filteredPlayers = allPlayers.filter(player => 
    !selectedPlayers.some(selected => selected.id === player.id) &&
    (player.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     player.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddPlayer = (player: User) => {
    // Vérifier si l'ajout du joueur ne dépasse pas la limite (4 joueurs au total)
    if (totalPlayers < 4) {
      setSelectedPlayers(prev => [...prev, player]);
      setSearchTerm('');
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Vérifier le nombre minimum de joueurs (au moins 2 joueurs au total)
    if (totalPlayers < 2) {
      setError('Veuillez sélectionner au moins un autre joueur');
      return;
    }

    // Vérifier le nombre maximum de joueurs (4 joueurs maximum)
    if (totalPlayers > 4) {
      setError('Le nombre maximum de joueurs est de 4');
      return;
    }

    try {
      // Create game with updated player count
      const gameData = {
        ...formData,
        minPlayers: 2,
        maxPlayers: 4,
        currentPlayers: totalPlayers
      };
      
      const gameResponse = await gameService.createGame(gameData);
      
      // Create session with selected players (including creator)
      const playerIds = selectedPlayers.map(p => p.id);
      await gameService.createGameSession(gameResponse.data.id, [currentUser!.id, ...playerIds]);
      
      // Redirect to game page
      navigate(`/games/${gameResponse.data.id}`);
    } catch (error: any) {
      console.error('Error creating game:', error);
      setError(error.response?.data?.message || 'Échec de la création de la partie');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--gold-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--bg-primary)] min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="game-title text-3xl mb-2">Nouvelle partie de fléchettes</h1>
        <p className="text-[var(--text-secondary)] mb-6">Sélectionnez vos adversaires pour commencer</p>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-lg backdrop-blur-sm border border-red-500/20 mb-4">
            {error}
          </div>
        )}

        <div className="game-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="game-title text-lg">
                Sélectionnez vos adversaires ({totalPlayers}/4)
              </h2>

              {/* Search input */}
              <div className="relative z-50">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un joueur..."
                  className="game-input w-full"
                  aria-label="Rechercher un joueur"
                />
                {searchTerm && filteredPlayers.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 game-card max-h-60 overflow-auto">
                    {filteredPlayers.map(player => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => handleAddPlayer(player)}
                        className="w-full p-3 text-left hover:bg-[var(--glass-bg)] flex items-center space-x-3 
                          text-[var(--text-primary)] transition-all duration-[var(--animation-speed-normal)]
                          hover:pl-4 group"
                        disabled={selectedPlayers.length >= 3}
                      >
                        <div className="w-8 h-8 flex items-center justify-center border border-[var(--neon-primary)] rounded-full
                          bg-[var(--glass-bg)] backdrop-blur-sm">
                          {player.firstName[0]}
                        </div>
                        <span className="transition-colors duration-[var(--animation-speed-normal)] 
                          group-hover:text-[var(--neon-primary)]">
                          {player.firstName} {player.lastName}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected players list */}
              <div className="space-y-3 relative z-0">
                {selectedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="game-card flex items-center justify-between animate-slideIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 flex items-center justify-center border border-[var(--neon-primary)] rounded-full
                        bg-[var(--glass-bg)] backdrop-blur-sm">
                        {player.firstName[0]}
                      </div>
                      <span className="text-[var(--text-primary)]">
                        {player.firstName} {player.lastName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(player)}
                      className="text-[var(--neon-accent)] hover:text-[var(--text-primary)] transition-colors"
                      aria-label={`Retirer ${player.firstName} ${player.lastName}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className={`
                game-button w-full text-lg
                ${selectedPlayers.length < 1 && 'opacity-50 cursor-not-allowed'}
              `}
              disabled={selectedPlayers.length < 1}
            >
              Commencer la partie
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGame; 