import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GameStatus } from '../../types/index';
import type { Player as BasePlayer } from '../../types/index';

interface Player extends BasePlayer {
  currentScore?: number;
}

interface DashboardGame {
  id: string;
  name: string;
  status: GameStatus;
  winner?: Player;
  players: Player[];
  startedAt?: Date;
}

interface ActiveGamesProps {
  games: DashboardGame[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  onPageChange: (page: number) => void;
}

const ActiveGames: React.FC<ActiveGamesProps> = ({ games, pagination, onPageChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusStyle = (status: GameStatus, hasWinner: boolean) => {
    switch (status) {
      case GameStatus.IN_PROGRESS:
        return 'text-[var(--status-in-progress)]';
      case GameStatus.COMPLETED:
        return hasWinner ? 'text-[var(--status-completed)]' : 'text-[var(--text-secondary)]';
      case GameStatus.CANCELLED:
        return 'text-[var(--status-cancelled)]';
      default:
        return 'text-[var(--text-secondary)]';
    }
  };

  const getStatusText = (status: GameStatus) => {
    switch (status) {
      case GameStatus.IN_PROGRESS:
        return 'En cours';
      case GameStatus.COMPLETED:
        return 'Terminée';
      case GameStatus.CANCELLED:
        return 'Annulée';
      case GameStatus.PENDING:
        return 'En attente';
      default:
        return status;
    }
  };

  const handleGameClick = (game: DashboardGame) => {
    if (!user) return;
    
    const isPlayerInGame = game.players.some(player => player.id === user.id);
    if (game.status === GameStatus.IN_PROGRESS && !game.winner && isPlayerInGame) {
      navigate(`/games/${game.id}`);
    }
  };

  const canJoinGame = (game: DashboardGame): boolean => {
    if (!user) return false;
    return game.status === GameStatus.IN_PROGRESS && !game.winner && game.players.some(player => player.id === user.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Liste des parties
        </h2>
        <div className="text-sm text-[var(--text-secondary)]">
          {pagination.totalItems} parties au total
        </div>
      </div>
      
      {games.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-[var(--text-secondary)]">Aucune partie</div>
        </div>
      ) : (
        <div className="dashboard-tile overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-[var(--text-secondary)] font-medium">Partie</th>
                <th className="text-left p-4 text-[var(--text-secondary)] font-medium">Status</th>
                <th className="text-left p-4 text-[var(--text-secondary)] font-medium">Joueurs</th>
                <th className="text-right p-4 text-[var(--text-secondary)] font-medium">Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {games.map((game) => (
                <tr 
                  key={game.id}
                  className={`hover:bg-white/5 transition-colors ${
                    canJoinGame(game) ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => handleGameClick(game)}
                >
                  <td className="p-4">
                    {canJoinGame(game) ? (
                      <span className="text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors">
                        {game.name}
                      </span>
                    ) : (
                      <span className="text-[var(--text-primary)]">
                        {game.name}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${getStatusStyle(game.status, !!game.winner)}`}>
                      {getStatusText(game.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {game.players.map((player, index) => (
                        <div key={player.id} className="flex items-center space-x-2">
                          <span className="text-[var(--text-secondary)] text-sm">
                            {index === 0 ? 'L' : 'C'}
                          </span>
                          <span className={`text-sm ${player.id === game.winner?.id ? 'text-[var(--status-completed)] font-medium' : 'text-[var(--text-primary)]'}`}>
                            {player.username}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right text-[var(--text-secondary)]">
                    {formatTime(game.startedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] disabled:opacity-50 hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Précédent
                </button>
                <span className="text-[var(--text-secondary)]">
                  Page {pagination.currentPage} sur {pagination.totalPages}
                </span>
                <button
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] disabled:opacity-50 hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveGames; 