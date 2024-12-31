import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../types';

const MainLayout = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

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

  const getStatusIndicator = (status: User['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-success';
      case 'INACTIVE':
        return 'status-warning';
      case 'BANNED':
        return 'status-error';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="glass border-b border-white/10">
        <div className="max-w-[2000px] mx-auto">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Left side */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] bg-clip-text text-transparent">
                  PlayRank
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex lg:items-center lg:ml-6 space-x-2">
                <Link
                  to="/"
                  className={`nav-link ${isActivePath('/') ? 'bg-[var(--secondary-dark)] text-[var(--text-primary)]' : ''}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/games"
                  className={`nav-link ${isActivePath('/games') ? 'bg-[var(--secondary-dark)] text-[var(--text-primary)]' : ''}`}
                >
                  Games
                </Link>
                <Link
                  to="/leaderboard"
                  className={`nav-link ${isActivePath('/leaderboard') ? 'bg-[var(--secondary-dark)] text-[var(--text-primary)]' : ''}`}
                >
                  Leaderboard
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/test-connection"
                    className={`nav-link ${isActivePath('/test-connection') ? 'bg-[var(--secondary-dark)] text-[var(--text-primary)]' : ''}`}
                  >
                    API Test
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            >
              <span className="sr-only">Open menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--secondary-dark)] flex items-center justify-center">
                      <span className="text-sm font-medium">{user.firstName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium flex items-center space-x-2">
                        <span>{user.firstName} {user.lastName}</span>
                        <span className={`text-xs ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className={`text-xs ${getStatusIndicator(user.status)}`}>
                        {user.status}
                      </div>
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 game-card">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-[var(--text-secondary)] border-b border-white/10">
                          <div>Signed in as</div>
                          <div className="font-medium text-[var(--text-primary)]">{user.email}</div>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm hover:bg-white/5"
                        >
                          Your Profile
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm hover:bg-white/5"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5 text-[var(--error)]"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-x-2">
                  <Link to="/login" className="btn-secondary">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block nav-link ${isActivePath('/') ? 'bg-[var(--secondary-dark)] text-[var(--text-primary)]' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/games"
                className={`block nav-link ${isActivePath('/games') ? 'bg-[var(--secondary-dark)] text-[var(--text-primary)]' : ''}`}
              >
                Games
              </Link>
              <Link
                to="/leaderboard"
                className={`block nav-link ${isActivePath('/leaderboard') ? 'bg-[var(--secondary-dark)] text-[var(--text-primary)]' : ''}`}
              >
                Leaderboard
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/test-connection"
                  className={`block nav-link ${isActivePath('/test-connection') ? 'bg-[var(--secondary-dark)] text-[var(--text-primary)]' : ''}`}
                >
                  API Test
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-[2000px] mx-auto">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/10 mt-8">
        <div className="max-w-[2000px] mx-auto py-4 px-4">
          <p className="text-center text-sm text-[var(--text-secondary)]">
            © 2024 PlayRank. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 