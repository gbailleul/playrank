import React from 'react';

interface GlobalStatsProps {
  globalStats: {
    averageAccuracy: number;
    averagePointsPerDart: number;
    averageGamesPerPlayer: number;
    totalDartsThrown: number;
    totalDoubles: number;
    totalTriples: number;
  };
}

const GlobalStats: React.FC<GlobalStatsProps> = ({ globalStats }) => {
  return (
    <div className="dashboard-tile p-6">
      <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
        Statistiques Globales
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="stat-item">
          <span className="stat-label">Précision moyenne</span>
          <span className="stat-value">{Math.round(globalStats.averageAccuracy)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Points moyens par fléchette</span>
          <span className="stat-value">{Math.round(globalStats.averagePointsPerDart)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Parties moyennes par joueur</span>
          <span className="stat-value">{Math.round(globalStats.averageGamesPerPlayer)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total de fléchettes lancées</span>
          <span className="stat-value">{globalStats.totalDartsThrown.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total de doubles</span>
          <span className="stat-value">{globalStats.totalDoubles.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total de triples</span>
          <span className="stat-value">{globalStats.totalTriples.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalStats; 