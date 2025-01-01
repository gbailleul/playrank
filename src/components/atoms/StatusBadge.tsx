import React from 'react';

type StatusType = 'success' | 'warning' | 'error';

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  className = '',
}) => {
  const statusClasses = {
    success: 'status-success',
    warning: 'status-warning',
    error: 'status-error'
  };

  return (
    <span className={`${statusClasses[status]} ${className}`}>
      {children}
    </span>
  );
};

export default StatusBadge; 