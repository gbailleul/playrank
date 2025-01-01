import React from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Navigation from './Navigation';

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onToggle,
}) => {
  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex items-center justify-center p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--element-bg-hover)]"
        aria-controls="mobile-menu"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className="sr-only">Open main menu</span>
        {isOpen ? (
          <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
        ) : (
          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div className="lg:hidden absolute top-16 inset-x-0 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] p-2">
          <Navigation isMobile />
        </div>
      )}
    </div>
  );
};

export default MobileMenu; 