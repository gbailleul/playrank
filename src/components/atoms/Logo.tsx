import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  withLink?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  className = '',
  withLink = true,
}) => {
  const logoContent = (
    <span className={`text-2xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] 
      bg-clip-text text-transparent transition-all duration-[var(--animation-speed-normal)] ${className}`}
    >
      PlayRank
    </span>
  );

  if (withLink) {
    return (
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity duration-[var(--animation-speed-normal)]">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo; 