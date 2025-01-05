import React from 'react';
import { Link } from 'react-router-dom';

interface Player {
  id: string;
  username: string;
  avatarUrl?: string;
  statistics: {
    gamesWon: number;
    winRate: number;
    averagePointsPerDart: number;
  };
}

interface TopPlayersProps {
  players: Player[];
}

const TopPlayers: React.FC<TopPlayersProps> = ({ players }) => {
  return (
    <div className="game-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Meilleurs Joueurs
        </h2>
        <Link to="/leaderboard" className="text-sm text-[var(--accent-blue)] hover:underline">
          Voir tout
        </Link>
      </div>
      <div className="space-y-4">
        {players.map((player, index) => (
          <div 
            key={player.id}
            className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] backdrop-blur-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] font-semibold">
                {index + 1}
              </div>
              <div className="flex items-center space-x-2">
                {player.avatarUrl ? (
                  <img 
                    src={player.avatarUrl} 
                    alt={player.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--secondary-dark)] flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {player.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="font-medium text-[var(--text-primary)]">
                  {player.username}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-right">
                <div className="text-[var(--text-secondary)]">Victoires</div>
                <div className="font-medium text-[var(--text-primary)]">{player.statistics.gamesWon}</div>
              </div>
              <div className="text-right">
                <div className="text-[var(--text-secondary)]">Taux</div>
                <div className="font-medium text-[var(--text-primary)]">{Math.round(player.statistics.winRate)}%</div>
              </div>
              <div className="text-right">
                <div className="text-[var(--text-secondary)]">Moy/Fléchette</div>
                <div className="font-medium text-[var(--text-primary)]">{Math.round(player.statistics.averagePointsPerDart)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPlayers; 