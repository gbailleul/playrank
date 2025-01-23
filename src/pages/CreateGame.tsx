import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateGameDto, User } from '../types/index';
import { GameType, DartVariant } from '../types/index';
import { gameService } from '../api/services';
import { auth } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

type DartGameVariant = '501' | '301' | 'Cricket' | 'Around the Clock';
type GuestPlayer = { id?: string; name: string; isGuest: true };
type Player = User | GuestPlayer;

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
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [guestName, setGuestName] = useState('');

  // Calculer le nombre total de joueurs
  const totalPlayers = selectedPlayers.length + (currentUser ? 1 : 0);

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
      if (currentUser) {
        try {
          const response = await auth.getAllUsers();
          // Filtrer l'utilisateur courant et l'utilisateur guest de la liste
          setAllPlayers(response.data.filter((user: User) => 
            user.id !== currentUser.id && 
            user.email !== 'guest@system.local'
          ));
        } catch (error) {
          console.error('Error fetching players:', error);
        }
      }
      setLoading(false);
    };
    fetchPlayers();
  }, [currentUser]);

  const handleAddPlayer = (player: User | string) => {
    if (selectedPlayers.length >= 3) return;

    if (typeof player === 'string') {
      // Ajouter un joueur invité
      const guestPlayer: GuestPlayer = {
        name: player,
        isGuest: true
      };
      setSelectedPlayers(prev => [...prev, guestPlayer]);
      setGuestName('');
      setIsAddingGuest(false);
    } else {
      // Ajouter un joueur existant
      if (!selectedPlayers.some(p => 'id' in p && p.id === player.id)) {
        setSelectedPlayers(prev => [...prev, player]);
      }
    }
    setSearchTerm('');
  };

  const handleRemovePlayer = (playerToRemove: Player) => {
    setSelectedPlayers(prev => prev.filter(p => 
      'isGuest' in p ? p.name !== ('isGuest' in playerToRemove ? playerToRemove.name : '') : p.id !== (playerToRemove as User).id
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (totalPlayers < 2) {
      setError('Veuillez sélectionner au moins un autre joueur');
      return;
    }

    if (totalPlayers > 4) {
      setError('Le nombre maximum de joueurs est de 4');
      return;
    }

    try {
      // Créer la liste des joueurs
      const players = selectedPlayers.map(player => 
        'isGuest' in player ? { name: player.name } : { id: player.id }
      );
      
      // Si l'utilisateur est connecté, l'ajouter à la liste des joueurs
      if (currentUser) {
        players.unshift({ id: currentUser.id });
      }

      // Créer le jeu avec la liste des joueurs
      const gameData: CreateGameDto & { players: Array<{ id?: string, name?: string }> } = {
        name: formData.name || `Partie de ${gameVariant}`,
        description: formData.description || `Partie de ${gameVariant} à ${totalPlayers} joueurs`,
        gameType: GameType.DARTS,
        maxScore: formData.maxScore,
        minPlayers: 2,
        maxPlayers: 4,
        variant: variantMapping[gameVariant],
        players
      };
      
      const { data: { game } } = await gameService.createGame(gameData);
      
      navigate(`/games/${game.id}`);
    } catch (error: any) {
      console.error('Error creating game:', error);
      setError(error.response?.data?.message || 'Échec de la création de la partie');
    }
  };

  // Filtrer les joueurs pour la recherche
  const filteredPlayers = searchTerm
    ? allPlayers.filter(player =>
        `${player.firstName} ${player.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : [];

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
        <p className="text-[var(--text-secondary)] mb-6">
          {currentUser 
            ? "Configurez votre partie et sélectionnez vos adversaires" 
            : "Configurez votre partie et ajoutez des joueurs"}
        </p>

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
              {currentUser ? `SÉLECTIONNEZ VOS ADVERSAIRES (${totalPlayers}/4)` : `AJOUTEZ DES JOUEURS (${totalPlayers}/4)`}
            </h2>
            
            {/* Search or Add Guest */}
            <div className="relative z-50">
              {isAddingGuest ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Nom du joueur invité..."
                    className="game-input flex-1"
                  />
                  <button
                    onClick={() => guestName && handleAddPlayer(guestName)}
                    className="game-button px-4"
                    disabled={!guestName}
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingGuest(false);
                      setGuestName('');
                    }}
                    className="game-button-secondary px-4"
                  >
                    Annuler
                  </button>
                </div>
              ) : currentUser ? (
                <>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un joueur..."
                    className="game-input w-full"
                  />
                  {searchTerm.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 game-card max-h-60 overflow-auto">
                      {filteredPlayers.length > 0 ? (
                        filteredPlayers.map(player => (
                          <button
                            key={player.id}
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
                        ))
                      ) : (
                        <div className="p-3 text-[var(--text-secondary)]">
                          Aucun joueur trouvé
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : null}
              
              {!isAddingGuest && selectedPlayers.length < 4 && (
                <button
                  onClick={() => setIsAddingGuest(true)}
                  className="game-button-secondary w-full mt-2"
                >
                  + Ajouter un joueur invité
                </button>
              )}
            </div>

            {/* Selected Players List */}
            <div className="space-y-3">
              {currentUser && (
                <div className="game-card p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center border border-[var(--neon-primary)] rounded-full
                      bg-[var(--glass-bg)] backdrop-blur-sm">
                      {currentUser.firstName[0]}
                    </div>
                    <span className="text-[var(--text-primary)]">
                      {currentUser.firstName} {currentUser.lastName} (Vous)
                    </span>
                  </div>
                </div>
              )}
              
              {selectedPlayers.map((player, index) => (
                <div
                  key={'isGuest' in player ? player.name : player.id}
                  className="game-card p-3 flex items-center justify-between animate-slideIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center border border-[var(--neon-primary)] rounded-full
                      bg-[var(--glass-bg)] backdrop-blur-sm">
                      {'isGuest' in player ? '👤' : player.firstName[0]}
                    </div>
                    <span className="text-[var(--text-primary)]">
                      {'isGuest' in player ? player.name : `${player.firstName} ${player.lastName}`}
                      {'isGuest' in player && <span className="ml-2 text-[var(--text-secondary)]">(Invité)</span>}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemovePlayer(player)}
                    className="text-[var(--neon-accent)] hover:text-[var(--text-primary)] transition-colors"
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
            className={`game-button w-full text-lg py-3 ${totalPlayers < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={totalPlayers < 2 || loading}
          >
            {loading ? 'Création...' : 'Commencer la partie'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGame; 