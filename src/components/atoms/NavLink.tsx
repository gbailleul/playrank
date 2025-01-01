import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({
  to,
  children,
  className = '',
  activeClassName = 'nav-link-active',
  exact = true,
  ...props
}) => {
  const location = useLocation();
  const isActive = exact 
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`nav-link ${isActive ? activeClassName : ''} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
};

export default NavLink; 