import React from 'react';
import { CricketGameState } from '../../../types/cricket';

interface ScorePanelProps {
  players: CricketGameState['players'];
  activePlayerId: string;
}

const ScorePanel: React.FC<ScorePanelProps> = ({ players, activePlayerId }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Scores</h2>
      <div className="space-y-4">
        {players.map((player) => (
          <div
            key={player.id}
            className={`p-3 rounded ${
              player.id === activePlayerId
                ? 'bg-blue-100 border-blue-500'
                : 'bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{player.username}</span>
              <span className="text-lg">{player.totalPoints} points</span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {Object.entries(player.scores).map(([target, score]) => (
                <div
                  key={target}
                  className={`text-center p-1 rounded ${
                    score.hits >= 3 ? 'bg-green-100' : 'bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{target}</div>
                  <div className="text-sm">
                    {score.hits >= 3 ? '✓' : `${score.hits}/3`}
                  </div>
                  {score.points > 0 && (
                    <div className="text-sm text-green-600">+{score.points}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScorePanel; 