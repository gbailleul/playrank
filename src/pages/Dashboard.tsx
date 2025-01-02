import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-fixed p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">
            Bienvenue, {user?.firstName}!
          </h1>
          <p className="text-[var(--text-secondary)]">
            Suivez vos scores et affrontez vos amis
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Start Game Card */}
          <Link 
            to="/games/new"
            className="card group"
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

          {/* Leaderboard Card */}
          <Link 
            to="/leaderboard"
            className="card group"
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

        {/* Recent Games Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Parties récentes</h2>
            <Link 
              to="/games/new" 
              className="btn-primary"
            >
              Créer une partie
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center py-8 text-[var(--text-secondary)]">
            <div className="icon-container mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-lg mb-2">Aucune partie récente</p>
            <p className="text-sm mb-4">Commencez par créer votre première partie !</p>
            <Link
              to="/games/new"
              className="btn-primary"
            >
              Créer une partie
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 