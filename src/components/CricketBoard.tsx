import React, { useState } from 'react';
import type { CricketGameState } from '../types/cricket';

interface CricketBoardProps {
  gameState: CricketGameState;
  onScoreClick: (target: number, multiplier: number) => void;
  currentPlayerId: string;
}

const CricketBoard: React.FC<CricketBoardProps> = ({ gameState, onScoreClick, currentPlayerId }) => {
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const targets = [20, 19, 18, 17, 16, 15, 25];

  const handleTargetClick = (target: number) => {
    setSelectedTarget(target);
  };

  const handleMultiplierClick = (multiplier: number) => {
    if (selectedTarget !== null) {
      onScoreClick(selectedTarget, multiplier);
      setSelectedTarget(null);
    }
  };

  const renderHitMarker = (hits: number, index: number) => {
    if (hits === 0) return <div className="w-6 h-6 rounded-full border-2 border-[var(--border-subtle)]" />;
    if (index === 0 && hits >= 1) return <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-primary)] bg-[var(--accent-primary)]/20 flex items-center justify-center">/</div>;
    if (index === 1 && hits >= 2) return <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-primary)] bg-[var(--accent-primary)]/20 flex items-center justify-center">×</div>;
    if (index === 2 && hits >= 3) return <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-primary)] bg-[var(--accent-primary)] flex items-center justify-center">●</div>;
    return <div className="w-6 h-6 rounded-full border-2 border-[var(--border-subtle)]" />;
  };

  return (
    <div className="space-y-4">
      {/* Score Table - More compact */}
      <div className="game-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="px-4 py-2 text-left text-lg">Cible</th>
              {gameState.players.map(player => (
                <th 
                  key={player.id}
                  className={`px-4 py-2 text-center text-lg ${
                    player.id === currentPlayerId ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {player.username}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {targets.map(target => (
              <tr 
                key={target} 
                className={`border-b border-[var(--border-subtle)] last:border-0 ${
                  selectedTarget === target ? 'bg-[var(--accent-primary)]/10' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium text-lg">
                  {target === 25 ? 'Bull' : target}
                </td>
                {gameState.players.map(player => {
                  const hits = player.scores[target].hits;
                  const points = player.scores[target].points;
                  return (
                    <td key={`${player.id}-${target}`} className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-2">
                          {[0, 1, 2].map((_, i) => (
                            <div key={i} className="flex items-center justify-center">
                              {renderHitMarker(hits, i)}
                            </div>
                          ))}
                        </div>
                        {points > 0 && (
                          <span className="text-[var(--accent-primary)] text-lg font-medium ml-2">
                            +{points}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t-2 border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <td className="px-4 py-3 font-medium text-lg">Total</td>
              {gameState.players.map(player => (
                <td key={player.id} className="px-4 py-3 text-center font-medium text-lg">
                  {player.totalPoints}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Interactive Controls */}
      <div className="game-card p-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {targets.map(target => (
            <button
              key={target}
              onClick={() => handleTargetClick(target)}
              className={`game-button-option aspect-square flex items-center justify-center text-xl font-medium
                ${selectedTarget === target ? 'active' : ''}`}
            >
              {target === 25 ? 'Bull' : target}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          {[1, 2, 3].map(multiplier => (
            <button
              key={multiplier}
              onClick={() => handleMultiplierClick(multiplier)}
              disabled={selectedTarget === null}
              className={`game-button-option px-8 py-3 text-xl font-medium
                ${selectedTarget === null ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {multiplier}x
            </button>
          ))}
        </div>
      </div>

      {/* Current Action Indicator */}
      <div className="text-center text-base text-[var(--text-secondary)]">
        {selectedTarget === null 
          ? "Sélectionnez une cible"
          : `Cible sélectionnée : ${selectedTarget === 25 ? 'Bull' : selectedTarget} - Choisissez un multiplicateur`}
      </div>
    </div>
  );
};

export default CricketBoard; 