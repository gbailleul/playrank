import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}

export interface DropdownItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  className = '',
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className={`
              absolute z-40 mt-2 w-56 rounded-xl overflow-hidden
              bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]
              shadow-[var(--shadow-strong)] animate-slideDown
              ${align === 'left' ? 'left-0' : 'right-0'}
              ${className}
            `}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  className = '',
  onClick,
}) => (
  <button
    className={`
      w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)]
      hover:bg-[var(--element-bg-hover)] hover:text-[var(--text-primary)]
      transition-colors duration-[var(--animation-speed-normal)]
      ${className}
    `}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Dropdown; 