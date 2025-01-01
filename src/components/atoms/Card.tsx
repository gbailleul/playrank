import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  hover = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div 
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 