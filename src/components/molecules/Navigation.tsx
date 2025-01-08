import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NavLink from '../atoms/NavLink';

interface NavigationProps {
  className?: string;
  isMobile?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  className = '',
  isMobile = false,
}) => {
  const { user } = useAuth();

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/leaderboard', label: 'Leaderboard' },
    ...(user?.role === 'ADMIN' ? [{ to: '/test-connection', label: 'API Test' }] : []),
  ];

  const baseClass = isMobile ? 'block' : 'hidden lg:flex lg:items-center lg:ml-6 space-x-2';

  return (
    <div className={`${baseClass} ${className}`}>
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          exact={to === '/'}
        >
          {label}
        </NavLink>
      ))}
    </div>
  );
};

export default Navigation; 