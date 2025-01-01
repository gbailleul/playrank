import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../molecules/Navigation';
import MobileMenu from '../molecules/MobileMenu';
import UserMenu from '../molecules/UserMenu';
import SettingsMenu from '../molecules/SettingsMenu';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="relative z-50 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-[var(--text-primary)]">
                PlayRank
              </Link>
            </div>
            <Navigation />
          </div>

          <div className="flex items-center space-x-4">
            <UserMenu />
            <SettingsMenu />
            <MobileMenu 
              isOpen={isMobileMenuOpen}
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 