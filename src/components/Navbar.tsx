import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  children?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] shadow-[var(--shadow-soft)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex items-center px-2 text-[var(--accent-primary)] font-bold text-xl hover:text-[var(--accent-secondary)] transition-colors duration-[var(--animation-speed-normal)]"
            >
              PlayRank
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link
                to="/"
                className="px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-[var(--animation-speed-normal)]"
              >
                Dashboard
              </Link>
              <Link
                to="/games"
                className="px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-[var(--animation-speed-normal)]"
              >
                Games
              </Link>
              <Link
                to="/leaderboard"
                className="px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-[var(--animation-speed-normal)]"
              >
                Leaderboard
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {children}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 