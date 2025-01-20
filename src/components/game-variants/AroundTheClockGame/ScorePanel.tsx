import React from 'react';
import { AroundTheClockPlayerState } from '../../../types/variants/aroundTheClock/types';

interface ScorePanelProps {
  players: AroundTheClockPlayerState[];
  activePlayerId: string;
}

const ScorePanel: React.FC<ScorePanelProps> = ({ players, activePlayerId }) => {
  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">Scores</h2>
      <div className="bg-[var(--glass-bg)] rounded-lg p-4">
        <div className="space-y-4">
          {players.map((player, index) => {
            const isCurrentPlayer = player.id === activePlayerId;

            return (
              <div
                key={`${player.id}-${index}`}
                className={`p-4 rounded-lg transition-all ${
                  isCurrentPlayer
                    ? 'bg-[var(--neon-primary)]/10 border border-[var(--neon-primary)] shadow-lg'
                    : 'bg-[var(--glass-bg-lighter)]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {isCurrentPlayer && (
                        <div className="absolute -left-2 -top-2">
                          <span className="text-[var(--neon-primary)]">🎯</span>
                        </div>
                      )}
                      <span className="text-lg font-medium text-[var(--text-primary)]">
                        {player.username}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[var(--text-primary)]">
                      {player.validatedCount} / 20
                    </div>
                    <div className="text-sm text-[var(--text-primary)]/70">
                      {player.totalThrows} lancers
                    </div>
                    <div className="text-sm text-[var(--text-primary)]/70">
                      Prochain : {player.currentNumber}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScorePanel; 