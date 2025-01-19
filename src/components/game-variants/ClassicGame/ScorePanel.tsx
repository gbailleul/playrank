import React from 'react';
import { GameSession } from '../../../types/base/game';
import { ClassicGameState } from '../../../types/variants/classic/types';

interface ScorePanelProps {
  session: GameSession;
  gameState: ClassicGameState;
  activePlayerIndex: number;
}

const ScorePanel: React.FC<ScorePanelProps> = ({ session, gameState, activePlayerIndex }) => {
  return (
    <div className="grid gap-4">
      {gameState.players.map((player, index) => (
        <div
          key={player.id}
          className={`p-4 rounded-lg ${
            index === activePlayerIndex ? 'bg-purple-900/50 border-2 border-purple-500' : 'bg-gray-800'
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">{player.username}</h3>
            <span className="text-lg text-gray-400">
              Score restant: {player.currentScore}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScorePanel; 