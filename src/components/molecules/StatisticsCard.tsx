import React from 'react';
import type { UserStatistics } from '../../types/index';

interface StatisticsCardProps {
  statistics: UserStatistics;
  className?: string;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ statistics, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
        Statistiques
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="stat-item">
          <span className="stat-label">Parties jouées</span>
          <span className="stat-value">{statistics.gamesPlayed}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Parties gagnées</span>
          <span className="stat-value">{statistics.gamesWon}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Ratio de victoires</span>
          <span className="stat-value">
            {statistics.gamesPlayed > 0
              ? `${((statistics.gamesWon / statistics.gamesPlayed) * 100).toFixed(1)}%`
              : '0%'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Précision</span>
          <span className="stat-value">{statistics.accuracy.toFixed(1)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Points par fléchette</span>
          <span className="stat-value">{statistics.averagePointsPerDart.toFixed(1)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Meilleur score</span>
          <span className="stat-value">{statistics.highestScore}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Doubles réussis</span>
          <span className="stat-value">{statistics.totalDoubles}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Triples réussis</span>
          <span className="stat-value">{statistics.totalTriples}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Fléchettes lancées</span>
          <span className="stat-value">{statistics.totalDartsThrown}</span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard; 