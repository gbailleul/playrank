import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateGameDto, User } from '../types';
import { gameService, auth } from '../api/services';
import { useAuth } from '../contexts/AuthContext';

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
  const [players, setPlayers] = useState<User[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data } = await auth.getAllPlayers();
        // Filtrer pour exclure l'utilisateur actuel et les utilisateurs inactifs/bannis
        const availablePlayers = data.filter(
          player => 
            player.id !== currentUser?.id && 
            player.status === 'ACTIVE' &&
            player.role === 'PLAYER'
        );
        setPlayers(availablePlayers);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError('Failed to load available players');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [currentUser?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedPlayers.length < 1) {
      setError('Veuillez sélectionner au moins un autre joueur');
      return;
    }

    try {
      // Créer la partie
      const gameResponse = await gameService.createGame(formData);
      
      // Créer la session avec les joueurs sélectionnés
      const allPlayers = [currentUser!.id, ...selectedPlayers];
      await gameService.createGameSession(gameResponse.data.id, allPlayers);
      
      // Rediriger vers la page de la partie
      navigate(`/games/${gameResponse.data.id}`);
    } catch (error: any) {
      console.error('Error creating game:', error);
      setError(error.response?.data?.message || 'Failed to create game');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-blue)]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Nouvelle partie de fléchettes</h1>
        <p className="text-[var(--text-secondary)] mb-6">Sélectionnez vos adversaires pour commencer</p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-[var(--error)] text-[var(--error)] rounded-md">
            {error}
          </div>
        )}

        <div className="game-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-[var(--text-primary)]">
                  Sélectionnez vos adversaires ({selectedPlayers.length}/3)
                </h2>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="maxScore"
                      value="301"
                      checked={formData.maxScore === 301}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                      className="form-radio text-[var(--accent-blue)]"
                    />
                    <span className="text-[var(--text-primary)]">301</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="maxScore"
                      value="501"
                      checked={formData.maxScore === 501}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                      className="form-radio text-[var(--accent-blue)]"
                    />
                    <span className="text-[var(--text-primary)]">501</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {players.map(player => (
                  <label
                    key={player.id}
                    className={`
                      flex items-center p-4 rounded-md border cursor-pointer transition-all
                      ${selectedPlayers.includes(player.id)
                        ? 'border-[var(--accent-blue)] bg-[var(--accent-blue-light)] shadow-md'
                        : 'border-[var(--border)] hover:border-[var(--accent-blue)] hover:shadow-sm'
                      }
                      ${selectedPlayers.length >= 3 && !selectedPlayers.includes(player.id)
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => {
                        if (selectedPlayers.includes(player.id)) {
                          setSelectedPlayers(prev => prev.filter(id => id !== player.id));
                        } else if (selectedPlayers.length < 3) {
                          setSelectedPlayers(prev => [...prev, player.id]);
                        }
                      }}
                      disabled={selectedPlayers.length >= 3 && !selectedPlayers.includes(player.id)}
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent-blue)] flex items-center justify-center text-white text-lg">
                        {player.firstName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">
                          {player.firstName} {player.lastName}
                        </div>
                      </div>
                      {selectedPlayers.includes(player.id) && (
                        <div className="ml-auto">
                          <svg className="w-6 h-6 text-[var(--accent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-primary text-lg py-3"
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