import { useState, useEffect } from 'react';
import { auth } from '../api/services';
import type { User, UserActivity } from '../types';

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
      case 'admin':
        return 'text-[var(--accent-purple)]';
      case 'player':
        return 'text-[var(--accent-blue)]';
      case 'viewer':
        return 'text-[var(--text-secondary)]';
      default:
        return '';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'text-[var(--success)]';
      case 'inactive':
        return 'text-[var(--warning)]';
      case 'banned':
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
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">{user.username}</h1>
              <div className="flex items-center space-x-4">
                <span className={`text-sm font-medium ${getRoleColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className={`text-sm ${getStatusColor(user.status)}`}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Account Information */}
          <div className="game-card p-6">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)]">Email</label>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)]">Member Since</label>
                <p className="mt-1">{formatDate(user.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)]">Last Updated</label>
                <p className="mt-1">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Game Statistics */}
          <div className="game-card p-6">
            <h2 className="text-lg font-semibold mb-4">Game Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="game-card bg-[var(--secondary-dark)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">Games Created</p>
                <p className="text-2xl font-bold mt-1">{user.statistics?.gamesCreated || 0}</p>
              </div>
              <div className="game-card bg-[var(--secondary-dark)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">Games Played</p>
                <p className="text-2xl font-bold mt-1">{user.statistics?.gamesPlayed || 0}</p>
              </div>
              <div className="game-card bg-[var(--secondary-dark)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">Games Won</p>
                <p className="text-2xl font-bold mt-1">{user.statistics?.gamesWon || 0}</p>
              </div>
              <div className="game-card bg-[var(--secondary-dark)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">Win Rate</p>
                <p className="text-2xl font-bold mt-1">{user.statistics?.winRate || 0}%</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="game-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            {user.recentActivity && user.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {user.recentActivity.map((activity: UserActivity, index: number) => (
                  <div key={index} className="flex items-start space-x-4">
                    {getActivityIcon(activity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {activity.type === 'game_created' ? (
                          <>Created a new {activity.game.gameType.toLowerCase()} game: <span className="text-[var(--accent-blue)]">{activity.game.name}</span></>
                        ) : (
                          <>
                            Played {activity.game.gameType.toLowerCase()}: <span className="text-[var(--accent-blue)]">{activity.game.name}</span>
                            {activity.result && (
                              <span className="ml-2">
                                {activity.result.won ? (
                                  <span className="text-[var(--success)]">Won</span>
                                ) : (
                                  <span className="text-[var(--text-secondary)]">
                                    {activity.result.rank ? `Ranked #${activity.result.rank}` : 'Participated'}
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
                <p>No recent activity to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 