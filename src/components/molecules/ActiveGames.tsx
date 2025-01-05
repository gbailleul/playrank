import React from 'react';
import { Link } from 'react-router-dom';
import { GameStatus } from '../../types/index';
import type { DashboardGame } from '../../types/index';

interface ActiveGamesProps {
  games: DashboardGame[];
}

const ActiveGames: React.FC<ActiveGamesProps> = ({ games }) => {
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">
        Liste des parties
      </h2>
      
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
                <th className="text-right p-4 text-[var(--text-secondary)] font-medium">Score</th>
                <th className="text-right p-4 text-[var(--text-secondary)] font-medium">Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {games.map((game) => (
                <tr 
                  key={game.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <Link 
                      to={`/games/${game.id}`}
                      className="text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                    >
                      {game.name}
                    </Link>
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
                  <td className="p-4">
                    <div className="space-y-1 text-right">
                      {game.players.map((player) => (
                        <div key={player.id}>
                          <span className={`text-sm ${player.id === game.winner?.id ? 'text-[var(--status-completed)] font-medium' : 'text-[var(--text-primary)]'}`}>
                            {player.currentScore}
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
        </div>
      )}
    </div>
  );
};

export default ActiveGames; 