import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateGameDto, User } from '../types/index';
import { GameType, DartVariant } from '../types/index';
import { gameService } from '../api/services';
import { auth } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

type DartGameVariant = '501' | '301' | 'Cricket' | 'Around the Clock';

const variantMapping: Record<DartGameVariant, DartVariant> = {
  '501': DartVariant.FIVE_HUNDRED_ONE,
  '301': DartVariant.THREE_HUNDRED_ONE,
  'Cricket': DartVariant.CRICKET,
  'Around the Clock': DartVariant.AROUND_THE_CLOCK
};

const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [gameVariant, setGameVariant] = useState<DartGameVariant>('501');
  const [formData, setFormData] = useState<CreateGameDto>({
    name: '',
    description: '',
    gameType: GameType.DARTS,
    maxScore: 501,
    minPlayers: 2,
    maxPlayers: 4,
    variant: DartVariant.FIVE_HUNDRED_ONE
  });
  const [error, setError] = useState<string | null>(null);
  const [allPlayers, setAllPlayers] = useState<User[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Calculer le nombre total de joueurs (incluant le créateur)
  const totalPlayers = selectedPlayers.length + 1;

  const handleVariantChange = (variant: DartGameVariant) => {
    setGameVariant(variant);
    let newMaxScore = 501;
    switch (variant) {
      case '501':
        newMaxScore = 501;
        break;
      case '301':
        newMaxScore = 301;
        break;
      case 'Cricket':
        newMaxScore = 0;
        break;
      case 'Around the Clock':
        newMaxScore = 20;
        break;
    }
    setFormData(prev => ({
      ...prev,
      maxScore: newMaxScore,
      variant: variantMapping[variant]
    }));
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data } = await auth.getAllPlayers();
        const availablePlayers = data.filter(
          player => 
            player.id !== currentUser?.id && 
            player.status === 'ACTIVE' &&
            player.role === 'PLAYER'
        );
        setAllPlayers(availablePlayers);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError('Échec du chargement des joueurs');
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
      const gameData: CreateGameDto = {
        name: formData.name || `Partie de ${gameVariant}`,
        description: formData.description || `Partie de ${gameVariant} à ${totalPlayers} joueurs`,
        gameType: GameType.DARTS,
        maxScore: formData.maxScore,
        minPlayers: 2,
        maxPlayers: 4,
        variant: variantMapping[gameVariant]
      };
      
      const { data: game } = await gameService.createGame(gameData);
      
      // Create session with selected players (including creator)
      const playerIds = selectedPlayers.map(p => p.id);
      const sessionData = {
        players: [currentUser!.id, ...playerIds]
      };
      
      await gameService.createGameSession(game.id, sessionData);
      
      // Redirect to game page
      navigate(`/games/${game.id}`);
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
        <h1 className="game-title text-3xl mb-2">NOUVELLE PARTIE DE FLÉCHETTES</h1>
        <p className="text-[var(--text-secondary)] mb-6">Configurez votre partie et sélectionnez vos adversaires</p>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-lg backdrop-blur-sm border border-red-500/20 mb-4">
            {error}
          </div>
        )}

        <div className="game-card p-6 space-y-8">
          {/* Game Type Selection */}
          <div className="space-y-4">
            <h2 className="game-title text-xl">TYPE DE JEU</h2>
            <div className="grid grid-cols-2 gap-4">
              {(['501', '301', 'Cricket', 'Around the Clock'] as DartGameVariant[]).map((variant) => (
                <button
                  key={variant}
                  type="button"
                  onClick={() => handleVariantChange(variant)}
                  className={`game-button-option ${
                    gameVariant === variant ? 'active' : ''
                  }`}
                >
                  <div className="text-lg font-semibold">{variant}</div>
                  <div className="text-sm mt-1 text-[var(--text-secondary)]">
                    {variant === '501' || variant === '301' 
                      ? 'Premier à zéro'
                      : variant === 'Cricket' 
                      ? 'Fermez les numéros et marquez des points'
                      : 'Touchez les numéros dans l\'ordre'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Player Selection */}
          <div className="space-y-4">
            <h2 className="game-title text-xl">
              SÉLECTIONNEZ VOS ADVERSAIRES ({totalPlayers}/4)
            </h2>
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

            {/* Selected Players List */}
            <div className="space-y-3">
              {selectedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className="game-card p-3 flex items-center justify-between animate-slideIn"
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
                    onClick={() => handleRemovePlayer(player.id)}
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

          {/* Optional Game Name */}
          <div className="space-y-4">
            <h2 className="game-title text-xl">NOM DE LA PARTIE (OPTIONNEL)</h2>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Tournoi du vendredi"
              className="game-input w-full"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className={`game-button w-full text-lg py-3 ${selectedPlayers.length < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={selectedPlayers.length < 1 || loading}
          >
            {loading ? 'Création...' : 'Commencer la partie'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGame; 