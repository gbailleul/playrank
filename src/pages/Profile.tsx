import { useState, useEffect } from 'react';
import { auth } from '../api/services';
import type { User, UserActivity } from '../types/index';
import ProgressCharts from '../components/molecules/ProgressCharts';

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await auth.getProfile();
        setUser(data);
        setError(null);
      } catch (err) {
        setError('Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-blue)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--error)] text-center">
          <p className="text-lg font-medium">{error}</p>
          <p className="text-sm mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--text-secondary)] text-center">
          <p className="text-lg font-medium">No profile data available</p>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'ADMIN':
        return 'text-[var(--accent-purple)]';
      case 'PLAYER':
        return 'text-[var(--accent-blue)]';
      case 'VIEWER':
        return 'text-[var(--text-secondary)]';
      default:
        return '';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-[var(--success)]';
      case 'INACTIVE':
        return 'text-[var(--warning)]';
      case 'BANNED':
        return 'text-[var(--error)]';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (activity: UserActivity) => {
    switch (activity.type) {
      case 'game_created':
        return (
          <div className="w-8 h-8 rounded-full bg-[var(--accent-blue)]/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'game_played':
        return (
          <div className="w-8 h-8 rounded-full bg-[var(--accent-purple)]/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--accent-purple)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="game-card p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-[var(--secondary-dark)] flex items-center justify-center">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-medium">
                  {user.firstName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">{user.firstName} {user.lastName}</h1>
              <div className="flex items-center space-x-4">
                <span className={`text-sm font-medium ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
                <span className={`text-sm ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Account Information */}
          <div className="game-card p-6">
            <h2 className="text-lg font-semibold mb-4">Informations du compte</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)]">Email</label>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)]">Membre depuis</label>
                <p className="mt-1">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)]">Dernière mise à jour</label>
                <p className="mt-1">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Game Statistics */}
          <div className="game-card p-6">
            <h2 className="text-lg font-semibold mb-4">Statistiques de jeu</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="game-card bg-[var(--secondary-dark)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">Parties créées</p>
                <p className="text-2xl font-bold mt-1">{user.statistics?.gamesCreated || 0}</p>
              </div>
              <div className="game-card bg-[var(--secondary-dark)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">Parties jouées</p>
                <p className="text-2xl font-bold mt-1">{user.statistics?.gamesPlayed || 0}</p>
              </div>
              <div className="game-card bg-[var(--secondary-dark)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">Parties gagnées</p>
                <p className="text-2xl font-bold mt-1">{user.statistics?.gamesWon || 0}</p>
              </div>
              <div className="game-card bg-[var(--secondary-dark)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">Taux de victoire</p>
                <p className="text-2xl font-bold mt-1">{user.statistics?.winRate || 0}%</p>
              </div>
            </div>
          </div>

          {/* Progress Charts */}
          <div className="md:col-span-2">
            {(() => {
              if (!user?.playerGames || user.playerGames.length === 0) {
                return null;
              }
              return <ProgressCharts playerGames={user.playerGames} />;
            })()}
          </div>

          {/* Recent Activity */}
          <div className="game-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Activité récente</h2>
            {user.recentActivity && user.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {user.recentActivity.map((activity: UserActivity, index: number) => (
                  <div key={index} className="flex items-start space-x-4">
                    {getActivityIcon(activity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {activity.type === 'game_created' ? (
                          <>A créé une nouvelle partie de {activity.game.gameType.toLowerCase()}: <span className="text-[var(--accent-blue)]">{activity.game.name}</span></>
                        ) : (
                          <>
                            A joué à {activity.game.gameType.toLowerCase()}: <span className="text-[var(--accent-blue)]">{activity.game.name}</span>
                            {activity.result && (
                              <span className="ml-2">
                                {activity.result.won ? (
                                  <span className="text-[var(--success)]">Victoire</span>
                                ) : (
                                  <span className="text-[var(--text-secondary)]">
                                    {activity.result.rank ? `Classé #${activity.result.rank}` : 'A participé'}
                                  </span>
                                )}
                              </span>
                            )}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-[var(--text-secondary)] py-8">
                <p>Aucune activité récente à afficher</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 