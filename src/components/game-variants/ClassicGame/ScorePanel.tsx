import React from 'react';
import { GameSession } from '../../../types/base/game';
import { ClassicGameState } from '../../../types/variants/classic/types';

interface ScorePanelProps {
  session: GameSession;
  gameState: ClassicGameState;
  activePlayerIndex: number;
}

const ScorePanel: React.FC<ScorePanelProps> = ({ session, gameState, activePlayerIndex }) => {
  if (!gameState || !gameState.players) {
    return (
      <div className="grid gap-4">
        <div className="p-4 rounded-lg bg-gray-800">
          <div className="text-white">Chargement des scores...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {session.players.map((sessionPlayer, index) => {
        const playerId = sessionPlayer.user?.id || sessionPlayer.guestPlayer?.id;
        const playerState = gameState.players.find(p => p.id === playerId);
        const playerName = sessionPlayer.user?.username || sessionPlayer.guestPlayer?.name;
        
        if (!playerState) return null;

        return (
          <div
            key={playerId}
            className={`p-4 rounded-lg ${
              index === activePlayerIndex ? 'bg-purple-900/50 border-2 border-purple-500' : 'bg-gray-800'
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">{playerName}</h3>
              <span className="text-lg text-gray-400">
                Score restant: {playerState.currentScore}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScorePanel; 