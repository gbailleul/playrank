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
        setError('Failed to load available players');
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
      setError(error.response?.data?.message || 'Failed to create game');
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
        <h1 className="vintage-title text-3xl mb-2">Nouvelle partie de fléchettes</h1>
        <p className="vintage-text text-[var(--text-secondary)] mb-6">Sélectionnez vos adversaires pour commencer</p>

        {error && (
          <div className="vintage-frame mb-4 border-red-500/50 bg-[var(--bg-secondary)]/50">
            <span className="text-red-400">{error}</span>
          </div>
        )}

        <div className="vintage-frame">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="vintage-title text-lg">
                Sélectionnez vos adversaires ({totalPlayers}/4)
              </h2>

              {/* Search input */}
              <div className="relative z-50">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un joueur..."
                  className="vintage-input w-full"
                  aria-label="Rechercher un joueur"
                />
                {searchTerm && filteredPlayers.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-[var(--bg-secondary)]/95 backdrop-blur-sm 
                    border border-[var(--gold-primary)] rounded-md shadow-[var(--shadow-strong)] max-h-60 overflow-auto
                    animate-slideDown"
                  >
                    {filteredPlayers.map(player => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => handleAddPlayer(player)}
                        className="w-full p-3 text-left hover:bg-[var(--element-bg-hover)] flex items-center space-x-3 
                          text-[var(--text-primary)] transition-all duration-[var(--animation-speed-normal)]
                          hover:pl-4 group"
                        disabled={selectedPlayers.length >= 3}
                      >
                        <div className="medal-frame w-8 h-8 flex items-center justify-center">
                          {player.firstName[0]}
                        </div>
                        <span className="transition-colors duration-[var(--animation-speed-normal)] 
                          group-hover:text-[var(--gold-primary)]"
                        >
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
                    className="leather-card flex items-center justify-between animate-slideIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="medal-frame w-8 h-8 flex items-center justify-center">
                        {player.firstName[0]}
                      </div>
                      <span className="font-medium text-[var(--text-primary)]">
                        {player.firstName} {player.lastName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(player.id)}
                      className="text-[var(--text-tertiary)] hover:text-red-500 
                        transition-colors duration-[var(--animation-speed-normal)]
                        p-2 rounded-full hover:bg-[var(--bg-tertiary)]"
                      aria-label={`Retirer ${player.firstName} ${player.lastName}`}
                    >
                      <svg className="w-5 h-5 transform transition-transform duration-[var(--animation-speed-normal)] 
                        hover:scale-110" 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Game Type Selector */}
              <div className="vintage-frame">
                <div className="relative z-10 flex flex-col space-y-6">
                  {/* Game Types */}
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gameType: 'DARTS' }))}
                      className={`
                        vintage-button flex items-center space-x-3
                        ${formData.gameType === 'DARTS' && 'scale-105'}
                      `}
                    >
                      <DartBoard size={32} className="flex-shrink-0" />
                      <span className="text-xl">Darts</span>
                    </button>
                    <button
                      type="button"
                      disabled
                      className="vintage-button opacity-50 cursor-not-allowed"
                    >
                      <span className="text-xl">🎯 Around the Clock</span>
                      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                        <span className="bg-[var(--gold-primary)] text-[var(--bg-primary)] text-xs px-2 py-1 rounded-full">
                          Bientôt
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Game Variants */}
                  <div className="flex flex-col items-center space-y-4">
                    <h3 className="vintage-title text-lg">Variante</h3>
                    <div className="flex justify-center space-x-3 bg-[var(--bg-tertiary)] p-2 rounded-xl">
                      {[301, 501, 701].map(score => (
                        <label
                          key={score}
                          className={`
                            vintage-button cursor-pointer
                            ${formData.maxScore === score && 'scale-105'}
                          `}
                        >
                          <input
                            type="radio"
                            name="maxScore"
                            value={score}
                            checked={formData.maxScore === score}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                            className="absolute opacity-0"
                          />
                          <div className="flex flex-col items-center space-y-1">
                            <span className="text-3xl font-bold">{score}</span>
                            <span className="text-sm opacity-90">points</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`
                vintage-button w-full text-lg
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