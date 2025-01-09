import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from './UserMenu';

const AuthButton: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    return <UserMenu />;
  }

  return (
    <Link
      to="/login"
      className="inline-flex items-center px-4 py-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--element-bg-hover)] transition-colors"
    >
      Connexion
    </Link>
  );
};

export default AuthButton; 