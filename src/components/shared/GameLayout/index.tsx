import React from 'react';
import VictoryModal from '../VictoryModal';

interface GameLayoutProps {
  title: string;
  infoMessage?: string;
  showVictoryModal?: boolean;
  winner?: {
    username: string;
    id: string;
  };
  onVictoryClose?: () => void;
  children: React.ReactNode;
}

const GameLayout: React.FC<GameLayoutProps> = ({
  title,
  infoMessage,
  showVictoryModal,
  winner,
  onVictoryClose,
  children,
}) => {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
      {showVictoryModal && winner && onVictoryClose && (
        <VictoryModal
          winner={winner}
          onClose={onVictoryClose}
        />
      )}

      <div className="bg-[var(--glass-bg)] rounded-lg shadow-xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4 sm:mb-0">
            {title}
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {infoMessage && (
              <div className="text-sm text-[var(--text-primary)] bg-[var(--neon-primary)]/10 px-4 py-2 rounded-lg">
                {infoMessage}
              </div>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default GameLayout; 