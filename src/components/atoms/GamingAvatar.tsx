import React from 'react';

interface GamingAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  frameType?: 'common' | 'rare' | 'epic' | 'legendary';
  className?: string;
  onClick?: () => void;
}

const GamingAvatar: React.FC<GamingAvatarProps> = ({
  name,
  imageUrl,
  size = 'md',
  frameType = 'common',
  className = '',
  onClick,
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  const frameClasses = {
    common: 'border-2 border-gray-400',
    rare: 'border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
    epic: 'border-2 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
    legendary: 'border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse'
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative rounded-full overflow-hidden
        ${sizeClasses[size]}
        ${frameClasses[frameType]}
        ${className}
        transition-all duration-300
        hover:scale-110
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)]
      `}
      aria-label={`Avatar of ${name}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${name}'s avatar`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[var(--element-bg)] flex items-center justify-center text-[var(--text-primary)]">
          {initials}
        </div>
      )}
    </button>
  );
};

export default GamingAvatar; 