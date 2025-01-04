import React from 'react';

interface GameButtonProps {
  variant?: 'primary' | 'secondary' | 'option';
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const GameButton: React.FC<GameButtonProps> = ({
  variant = 'primary',
  children,
  active = false,
  disabled = false,
  onClick,
  className = '',
}) => {
  const baseClass = variant === 'primary' 
    ? 'game-button'
    : variant === 'secondary'
    ? 'game-button-secondary'
    : 'game-button-option';

  const activeClass = active && variant === 'option' ? 'active' : '';
  
  return (
    <button
      type="button"
      className={`${baseClass} ${activeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}; 