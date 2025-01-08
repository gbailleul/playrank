import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../api/services';
import type { DashboardResponse } from '../types/index';
import StatisticsCard from '../components/molecules/StatisticsCard';
import GlobalStats from '../components/molecules/GlobalStats';
import ActiveGames from '../components/molecules/ActiveGames';
import TopPlayers from '../components/molecules/TopPlayers';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (page: number) => {
    try {
      setIsLoading(true);
      const { data } = await dashboardService.getDashboard(page);
      console.log('data dashboard', data);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] bg-fixed p-6 flex items-center justify-center">
        <div className="text-[var(--text-primary)]">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] bg-fixed p-6 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-fixed p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">
            {user ? `Bienvenue, ${user.firstName}!` : 'Bienvenue sur PlayRank!'}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {user ? 'Suivez vos scores et affrontez vos amis' : 'La plateforme de suivi de scores pour les passionnés de fléchettes'}
          </p>
        </div>

        {/* Quick Actions Grid */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link 
              to="/games/new"
              className="dashboard-tile p-6 group hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="icon-container mb-4">
                    <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">Nouvelle partie</h2>
                  <p className="text-[var(--text-secondary)]">Créer une nouvelle partie et inviter des joueurs</p>
                </div>
                <div className="bg-[var(--accent-primary)]/10 p-2 rounded-lg">
                  <svg className="w-8 h-8 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link 
              to="/leaderboard"
              className="dashboard-tile p-6 group hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="icon-container mb-4">
                    <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">Voir le classement</h2>
                  <p className="text-[var(--text-secondary)]">Consultez les classements et visez la première place</p>
                </div>
                <div className="bg-[var(--accent-primary)]/10 p-2 rounded-lg">
                  <svg className="w-8 h-8 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Games List Section */}
        {dashboardData?.games && (
          <div className="mb-8">
            <ActiveGames 
              games={dashboardData.games} 
              pagination={dashboardData.pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Stats Section - Full Width */}
        {dashboardData?.globalStats && (
          <div className="mb-8">
            <GlobalStats globalStats={dashboardData.globalStats} />
          </div>
        )}

        {/* User Statistics Section - Full Width */}
        {user?.statistics && (
          <div className="mb-8">
            <StatisticsCard statistics={user.statistics} />
          </div>
        )}

        {/* Top Players Section */}
        {dashboardData?.topPlayers && (
          <div className="mb-8">
            <TopPlayers players={dashboardData.topPlayers} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 