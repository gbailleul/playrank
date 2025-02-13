import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AvatarSelector from './AvatarSelector';
import Dropdown, { DropdownItem } from '../atoms/Dropdown';
import StatusBadge from '../atoms/StatusBadge';
import type { User } from '../../types/index';
import { FiLogOut } from 'react-icons/fi';

interface UserMenuProps {
  className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ className = '' }) => {
  const { user, logout, updateUserAvatar } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleAvatarChange = async (avatarData: string | File) => {
    try {
      if (typeof avatarData === 'string') {
        await updateUserAvatar(avatarData);
      }
      // Gérer le cas File si nécessaire
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
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

  const getFrameType = (role: User['role']) => {
    switch (role) {
      case 'ADMIN':
        return 'legendary';
      case 'PLAYER':
        return 'epic';
      case 'VIEWER':
        return 'common';
      default:
        return 'common';
    }
  };

  const trigger = (
    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[var(--element-bg-hover)]">
      <AvatarSelector
        currentAvatar={user.avatarUrl}
        userName={`${user.firstName} ${user.lastName}`}
        onAvatarChange={handleAvatarChange}
        frameType={getFrameType(user.role)}
      />
      <div className="hidden sm:block text-left">
        <div className="text-sm font-medium flex items-center space-x-2">
          <span className="text-[var(--text-primary)]">{user.firstName} {user.lastName}</span>
          <span className={`text-xs ${getRoleColor(user.role)}`}>
            {user.role}
          </span>
        </div>
        <StatusBadge status={getStatusType(user.status)}>
          {user.status}
        </StatusBadge>
      </div>
    </div>
  );

  return (
    <Dropdown 
      trigger={trigger}
      className={className}
    >
      <div className="py-1">
        <div className="px-4 py-2 text-sm text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
          <div>Connecté en tant que</div>
          <div className="font-medium text-[var(--text-primary)]">{user.email}</div>
        </div>
        <DropdownItem onClick={() => navigate('/profile')}>
          Votre Profil
        </DropdownItem>
        {user.role === 'ADMIN' && (
          <DropdownItem onClick={() => navigate('/admin')}>
            Tableau de Bord Admin
          </DropdownItem>
        )}
        <button
          onClick={handleLogout}
          className="game-button-secondary w-full text-left px-4 py-2 flex items-center space-x-2"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </Dropdown>
  );
};

export default UserMenu; 