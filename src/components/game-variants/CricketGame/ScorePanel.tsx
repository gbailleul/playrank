import React from 'react';
import { CricketGameState } from '../../../types/variants/cricket/types';

interface ScorePanelProps {
  gameState: CricketGameState;
  activePlayerIndex: number;
}

const ScorePanel: React.FC<ScorePanelProps> = ({ gameState, activePlayerIndex }) => {
  // Les cibles du Cricket dans l'ordre
  const targets = [20, 19, 18, 17, 16, 15, 25];

  // Retourne le symbole pour le nombre de hits
  const getHitSymbol = (hits: number) => {
    if (hits === 0) return '';
    if (hits === 1) return '/';
    if (hits === 2) return 'X';
    return '●';
  };

  const currentPlayer = gameState.players[activePlayerIndex];

  return (
    <div className="bg-[var(--glass-bg)] rounded-lg p-4">
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Tableau des scores</h2>
      <div className="space-y-4">
        {/* En-tête avec les numéros */}
        <div className="grid grid-cols-[2fr,repeat(7,1fr)] gap-2 items-center border-b border-[var(--border-color)] pb-2">
          <div className="text-[var(--text-primary)]">Joueur</div>
          {targets.map(target => (
            <div key={target} className="text-center text-[var(--text-primary)]">
              {target}
            </div>
          ))}
        </div>

        {/* Scores des joueurs */}
        {gameState.players.map(player => (
          <div
            key={player.id}
            className={`grid grid-cols-[2fr,repeat(7,1fr)] gap-2 items-center py-2 ${
              player.id === currentPlayer?.id
                ? 'bg-[var(--neon-primary)]/10 rounded-lg border border-[var(--neon-primary)] px-2'
                : ''
            }`}
          >
            {/* Nom et score total */}
            <div className="flex flex-col">
              <span className="text-[var(--text-primary)] font-medium">{player.username}</span>
              <span className="text-sm text-[var(--text-primary)]/70">{player.totalPoints} pts</span>
            </div>

            {/* Hits pour chaque cible */}
            {targets.map(target => {
              const score = player.scores[target.toString()];
              const hits = score?.hits || 0;
              const points = score?.points || 0;
              const isClosed = hits >= 3;

              return (
                <div
                  key={target}
                  className={`text-center flex flex-col items-center justify-center ${
                    isClosed ? 'text-green-500' : 'text-[var(--text-primary)]'
                  }`}
                >
                  <span className="font-bold">{getHitSymbol(hits)}</span>
                  {points > 0 && (
                    <span className="text-xs text-[var(--text-primary)]/70">
                      +{points}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScorePanel; 