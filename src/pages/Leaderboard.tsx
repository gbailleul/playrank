import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { leaderboardService } from '../api/services/leaderboardService';
import type { LeaderboardResponse, LeaderboardEntry } from '../types/index';
import { DartVariant } from '../types/index';
import GamingAvatar from '../components/atoms/GamingAvatar';
import ResponsiveTable from '../components/atoms/ResponsiveTable';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedGameType, setSelectedGameType] = useState<DartVariant>(DartVariant.FIVE_HUNDRED_ONE);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await leaderboardService.getLeaderboard(selectedGameType);
        setLeaderboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Erreur lors du chargement du classement');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedGameType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-primary)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--error)] text-center">
          <p className="text-lg font-medium">{error}</p>
          <p className="text-sm mt-2">Veuillez réessayer plus tard</p>
        </div>
      </div>
    );
  }

  const gameTypeLabels: Record<DartVariant, string> = {
    [DartVariant.THREE_HUNDRED_ONE]: '301',
    [DartVariant.FIVE_HUNDRED_ONE]: '501',
    [DartVariant.CRICKET]: 'Cricket',
    [DartVariant.AROUND_THE_CLOCK]: 'Around the Clock'
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-fixed p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">Classement</h1>
          <div className="flex space-x-4">
            {Object.values(DartVariant).map((type: DartVariant) => (
              <button
                key={type}
                onClick={() => setSelectedGameType(type)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  selectedGameType === type
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {gameTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        {leaderboardData && (
          <ResponsiveTable>
            <table className="table">
              <thead>
                <tr className="text-[var(--text-secondary)] text-left">
                  <th>Rang</th>
                  <th>Joueur</th>
                  <th>Parties jouées</th>
                  <th>Parties gagnées</th>
                  <th>Taux de victoire</th>
                  <th>Précision</th>
                  <th>Points/Fléchette</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.entries.map((entry: LeaderboardEntry) => (
                  <tr
                    key={entry.id}
                    className={`border-t border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors duration-200 ${
                      entry.id === user?.id ? 'bg-[var(--accent-primary)]/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">{entry.rank}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <GamingAvatar
                          name={entry.username}
                          imageUrl={entry.avatarUrl}
                          size="sm"
                        />
                        <span className="font-medium">{entry.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{entry.gamesPlayed}</td>
                    <td className="px-6 py-4">{entry.gamesWon}</td>
                    <td className="px-6 py-4">{entry.winRate.toFixed(1)}%</td>
                    <td className="px-6 py-4">{entry.accuracy.toFixed(1)}%</td>
                    <td className="px-6 py-4">{entry.averagePointsPerDart.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        )}

        {/* User's Rank (if not in top 100) */}
        {leaderboardData?.userRank && (
          <div className="mt-8 p-4 border-t border-[var(--border-subtle)]">
            <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Votre position</h2>
            <ResponsiveTable>
              <table className="table">
                <tbody>
                  <tr className="bg-[var(--accent-primary)]/10">
                    <td className="px-6 py-4">{leaderboardData.userRank.rank}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <GamingAvatar
                          name={leaderboardData.userRank.username}
                          imageUrl={leaderboardData.userRank.avatarUrl}
                          size="sm"
                        />
                        <span className="font-medium">{leaderboardData.userRank.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{leaderboardData.userRank.gamesPlayed}</td>
                    <td className="px-6 py-4">{leaderboardData.userRank.gamesWon}</td>
                    <td className="px-6 py-4">{leaderboardData.userRank.winRate.toFixed(1)}%</td>
                    <td className="px-6 py-4">{leaderboardData.userRank.accuracy.toFixed(1)}%</td>
                    <td className="px-6 py-4">{leaderboardData.userRank.averagePointsPerDart.toFixed(1)}</td>
                  </tr>
                </tbody>
              </table>
            </ResponsiveTable>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 