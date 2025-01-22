import React from 'react';
import { Dialog } from '@headlessui/react';

interface GameEndDialogProps {
  isOpen: boolean;
  winner: string;
  onClose: () => void;
  stats?: {
    totalThrows?: number;
    validatedCount?: number;
    points?: number;
  };
}

const GameEndDialog: React.FC<GameEndDialogProps> = ({
  isOpen,
  winner,
  onClose,
  stats
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-[var(--glass-bg)] p-6 shadow-xl">
          <Dialog.Title className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            🎯 Partie terminée !
          </Dialog.Title>

          <div className="space-y-4">
            <p className="text-lg text-[var(--text-primary)]">
              <span className="font-bold text-[var(--neon-primary)]">{winner}</span> remporte la partie !
            </p>

            {stats && (
              <div className="space-y-2">
                {stats.totalThrows !== undefined && (
                  <p className="text-[var(--text-primary)]/80">
                    Nombre total de lancers : {stats.totalThrows}
                  </p>
                )}
                {stats.validatedCount !== undefined && (
                  <p className="text-[var(--text-primary)]/80">
                    Nombres validés : {stats.validatedCount}
                  </p>
                )}
                {stats.points !== undefined && (
                  <p className="text-[var(--text-primary)]/80">
                    Points : {stats.points}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-2 mt-4 text-black font-bold bg-[var(--neon-primary)] rounded-lg hover:bg-[var(--neon-primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--neon-primary)]"
            >
              Fermer
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default GameEndDialog; 