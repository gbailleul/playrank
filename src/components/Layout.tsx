import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  TrophyIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Games', href: '/games', icon: TrophyIcon },
    { name: 'Players', href: '/players', icon: UserGroupIcon },
    { name: 'Statistics', href: '/statistics', icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen bg-secondary-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-secondary-800">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-secondary-900">
            <h1 className="text-2xl font-bold text-primary-500">PlayRank</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname === item.href
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-300 hover:bg-secondary-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-secondary-700">
            {user && (
              <div className="flex items-center">
                <img
                  src={user.avatar_url || 'https://via.placeholder.com/40'}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.username}</p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-sm text-secondary-400 hover:text-white transition-colors duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout; 