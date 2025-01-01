import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SettingsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'night', name: 'Nuit', icon: '🌙' },
    { id: 'sunset', name: 'Coucher de soleil', icon: '🌅' },
    { id: 'forest', name: 'Forêt', icon: '🌲' },
    { id: 'ocean', name: 'Océan', icon: '🌊' },
  ] as const;

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full transition-all duration-[var(--animation-speed-normal)]
          hover:bg-[var(--element-bg-hover)] group"
        aria-label="Paramètres"
      >
        <svg
          className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]
            transition-all duration-[var(--animation-speed-normal)] group-hover:rotate-90"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]
            shadow-[var(--shadow-strong)] z-50 overflow-hidden animate-slideDown"
          >
            <div className="p-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-[var(--text-primary)] font-medium">Paramètres</h3>
            </div>
            
            <div className="p-4">
              <h4 className="text-[var(--text-secondary)] text-sm font-medium mb-3">Thème</h4>
              <div className="space-y-2">
                {themes.map(({ id, name, icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setTheme(id as any);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full p-3 rounded-lg flex items-center space-x-3
                      transition-all duration-[var(--animation-speed-normal)]
                      ${theme === id 
                        ? 'bg-[var(--element-bg-active)] shadow-[var(--shadow-glow)]' 
                        : 'hover:bg-[var(--element-bg-hover)]'
                      }
                    `}
                  >
                    <span className="text-xl">{icon}</span>
                    <span className={`
                      flex-1 text-left transition-colors duration-[var(--animation-speed-normal)]
                      ${theme === id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}
                    `}>
                      {name}
                    </span>
                    {theme === id && (
                      <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SettingsMenu; 