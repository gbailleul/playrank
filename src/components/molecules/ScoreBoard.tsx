import React from 'react';
import { AroundTheClockGameState } from '../../types/aroundTheClock';

interface ScoreBoardProps {
  gameState: AroundTheClockGameState;
  currentPlayerId: string;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ gameState, currentPlayerId }) => {
  return (
    <div className="bg-[var(--glass-bg)] rounded-lg shadow-xl p-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Tableau des scores</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left py-2 px-4 text-[var(--text-primary)]">Joueur</th>
              <th className="text-center py-2 px-4 text-[var(--text-primary)]">Zones validées</th>
              <th className="text-center py-2 px-4 text-[var(--text-primary)]">Lancers</th>
              <th className="text-center py-2 px-4 text-[var(--text-primary)]">Prochain numéro</th>
            </tr>
          </thead>
          <tbody>
            {gameState.players.map((player) => (
              <tr 
                key={player.id}
                className={`
                  border-b border-[var(--border-color)] 
                  ${player.id === currentPlayerId ? 'bg-[var(--neon-primary)]/10' : ''}
                `}
              >
                <td className="py-2 px-4 text-[var(--text-primary)]">
                  {player.username}
                </td>
                <td className="text-center py-2 px-4 text-[var(--text-primary)]">
                  {player.validatedCount} / 20
                </td>
                <td className="text-center py-2 px-4 text-[var(--text-primary)]">
                  {player.totalThrows}
                </td>
                <td className="text-center py-2 px-4 text-[var(--text-primary)]">
                  {player.currentNumber}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreBoard; 