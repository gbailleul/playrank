import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { PlayerGame, Score } from '../../types/index';

interface ProgressChartsProps {
  playerGames: PlayerGame[];
}

const ProgressCharts: React.FC<ProgressChartsProps> = ({ playerGames }) => {
  const progressData = useMemo(() => {
    const sortedGames = [...playerGames].sort((a, b) => 
      new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
    );

    const data = sortedGames.map((game, index) => {
      const gamesUpToNow = sortedGames.slice(0, index + 1);
      const gamesWon = gamesUpToNow.filter(g => g.gameSessionId === game.playerId).length;
      const winRate = (gamesWon / (index + 1)) * 100;

      let totalPoints = 0;
      let totalDarts = 0;
      let highScoreShots = 0;

      gamesUpToNow.forEach(playerGame => {
        playerGame.scores.forEach((score: Score) => {
          totalPoints += score.points;
          totalDarts += 3;
          if (score.points > 40) {
            highScoreShots++;
          }
        });
      });

      const accuracy = totalDarts > 0 ? (highScoreShots * 3 / totalDarts) * 100 : 0;

      return {
        date: new Date(game.joinedAt).toLocaleDateString(),
        winRate: Math.round(winRate),
        accuracy: Math.round(accuracy)
      };
    });

    return data;
  }, [playerGames]);

  if (!progressData.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="game-card p-6">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
          Progression du taux de victoire
        </h3>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--text-secondary)" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)' }}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)' }}
                unit="%"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: 'var(--text-primary)' }}
                itemStyle={{ color: 'var(--accent-blue)' }}
              />
              <Line 
                type="monotone" 
                dataKey="winRate" 
                stroke="var(--accent-blue)" 
                strokeWidth={2}
                dot={{ fill: 'var(--accent-blue)', strokeWidth: 2 }}
                name="Taux de victoire"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="game-card p-6">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
          Progression de la précision
        </h3>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--text-secondary)" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)' }}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                tick={{ fill: 'var(--text-secondary)' }}
                unit="%"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: 'var(--text-primary)' }}
                itemStyle={{ color: 'var(--accent-purple)' }}
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="var(--accent-purple)" 
                strokeWidth={2}
                dot={{ fill: 'var(--accent-purple)', strokeWidth: 2 }}
                name="Précision"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProgressCharts; 