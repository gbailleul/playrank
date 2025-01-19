import React from 'react';

interface VictoryModalProps {
  winner: {
    username: string;
    id: string;
  };
  onClose: () => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ winner, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--glass-bg)] rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            🎯 Victoire ! 🎯
          </h2>
          <p className="text-xl text-[var(--text-primary)] mb-8">
            Félicitations à {winner.username} !
          </p>
          <button
            onClick={onClose}
            className="bg-[var(--neon-primary)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--neon-primary)]/80 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
};

export default VictoryModal; 