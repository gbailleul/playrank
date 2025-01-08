import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import Dropdown, { DropdownItem } from '../atoms/Dropdown';

interface SettingsMenuProps {
  className?: string;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ id: 'night' | 'sunset' | 'forest' | 'ocean'; label: string }> = [
    { id: 'night', label: '🌙 Night' },
    { id: 'sunset', label: '🌅 Sunset' },
    { id: 'forest', label: '🌲 Forest' },
    { id: 'ocean', label: '🌊 Ocean' },
  ];

  const trigger = (
    <button 
      className="p-2 rounded-lg hover:bg-[var(--element-bg-hover)]"
      aria-label="Settings"
    >
      <Cog6ToothIcon className="h-6 w-6 text-[var(--text-secondary)]" />
    </button>
  );

  return (
    <Dropdown 
      trigger={trigger}
      className={`w-72 ${className}`}
    >
      <div className="py-1">
        <div className="px-4 py-2 text-sm text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
          Theme
        </div>
        {themes.map(({ id, label }) => (
          <DropdownItem
            key={id}
            onClick={() => setTheme(id)}
            className={theme === id ? 'bg-[var(--element-bg-hover)]' : ''}
          >
            {label}
          </DropdownItem>
        ))}
      </div>
    </Dropdown>
  );
};

export default SettingsMenu; 