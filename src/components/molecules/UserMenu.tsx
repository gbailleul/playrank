import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../atoms/Avatar';
import Dropdown, { DropdownItem } from '../atoms/Dropdown';
import StatusBadge from '../atoms/StatusBadge';
import type { User } from '../../types';

interface UserMenuProps {
  className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'ADMIN':
        return 'text-[var(--accent-primary)]';
      case 'PLAYER':
        return 'text-[var(--accent-secondary)]';
      case 'VIEWER':
        return 'text-[var(--text-secondary)]';
      default:
        return '';
    }
  };

  const getStatusType = (status: User['status']): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'BANNED':
        return 'error';
      default:
        return 'error';
    }
  };

  const trigger = (
    <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[var(--element-bg-hover)]">
      <Avatar name={`${user.firstName} ${user.lastName}`} />
      <div className="hidden sm:block text-left">
        <div className="text-sm font-medium flex items-center space-x-2">
          <span>{user.firstName} {user.lastName}</span>
          <span className={`text-xs ${getRoleColor(user.role)}`}>
            {user.role}
          </span>
        </div>
        <StatusBadge status={getStatusType(user.status)}>
          {user.status}
        </StatusBadge>
      </div>
    </button>
  );

  return (
    <Dropdown 
      trigger={trigger}
      className={className}
    >
      <div className="py-1">
        <div className="px-4 py-2 text-sm text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
          <div>Signed in as</div>
          <div className="font-medium text-[var(--text-primary)]">{user.email}</div>
        </div>
        <DropdownItem onClick={() => navigate('/profile')}>
          Your Profile
        </DropdownItem>
        {user.role === 'ADMIN' && (
          <DropdownItem onClick={() => navigate('/admin')}>
            Admin Dashboard
          </DropdownItem>
        )}
        <DropdownItem 
          onClick={handleLogout}
          className="text-red-500 hover:bg-red-500/10"
        >
          Sign out
        </DropdownItem>
      </div>
    </Dropdown>
  );
};

export default UserMenu; 