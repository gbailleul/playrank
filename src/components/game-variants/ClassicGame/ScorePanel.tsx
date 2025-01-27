import React, { useMemo } from 'react';
import { Score } from '../../../types/base/game';
import { ClassicGameState, ClassicPlayerState } from '../../../types/variants/classic/types';

interface ScorePanelProps {
  gameState: ClassicGameState;
  activePlayerIndex: number;
}

interface PlayerScoreData {
  playerState: ClassicPlayerState;
  sortedScores: Score[];
}

const ScorePanel: React.FC<ScorePanelProps> = React.memo(({ gameState, activePlayerIndex }) => {
  if (!gameState || !gameState.players) {
    return (
      <div className="grid gap-4">
        <div className="p-4 rounded-lg bg-gray-800">
          <div className="text-white">Chargement des scores...</div>
        </div>
      </div>
    );
  }

  // Mémoriser les scores triés pour chaque joueur
  const playerScores = useMemo(() => {
    return gameState.players.map(playerState => {
      // Trier les scores par numéro de tour
      const sortedScores = [...playerState.scores].sort((a, b) => b.turnNumber - a.turnNumber);

      return {
        playerState,
        sortedScores
      } as PlayerScoreData;
    });
  }, [gameState.players]);

  return (
    <div className="grid gap-4">
      {playerScores.map(({ playerState, sortedScores }, index) => (
        <div
          key={playerState.id}
          className={`p-4 rounded-lg ${
            index === activePlayerIndex ? 'bg-purple-900/50 border-2 border-purple-500' : 'bg-gray-800'
          }`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">{playerState.username}</h3>
              <span className="text-lg text-gray-400">
                Score restant: {playerState.currentScore}
              </span>
            </div>
            
            {/* Historique des scores */}
            <div className="mt-2">
              <div className="text-sm text-gray-400">Historique des scores:</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {sortedScores.map((score: Score) => (
                  <span key={score.id} className="text-sm text-white bg-gray-700 px-2 py-1 rounded">
                    Tour {score.turnNumber}: {score.points}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

ScorePanel.displayName = 'ScorePanel';

export default ScorePanel; 