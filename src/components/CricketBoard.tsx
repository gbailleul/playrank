import React, { useState } from 'react';
import { CricketGameState, CricketTarget } from '../types/cricket';
import CricketRules from './CricketRules';

interface CricketBoardProps {
  gameState: CricketGameState;
  onScore: (target: number, multiplier: number) => void;
}

const CricketBoard: React.FC<CricketBoardProps> = ({ gameState, onScore }) => {
  const [showRules, setShowRules] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<CricketTarget | null>(null);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(1);

  // Vérifier si le gameState est initialisé
  if (!gameState || !gameState.players || !gameState.players.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading game state...</p>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const targets: CricketTarget[] = [20, 19, 18, 17, 16, 15, 25];

  // Fonction pour déterminer si une cible est fermée pour un joueur
  const isTargetClosed = (playerId: string, target: CricketTarget) => {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return false;
    return player.scores[target]?.hits >= 3;
  };

  // Fonction pour déterminer si une cible est fermée par tous les joueurs
  const isTargetClosedByAll = (target: CricketTarget) => {
    return gameState.players.every(player => isTargetClosed(player.id, target));
  };

  // Fonction pour obtenir le statut d'une cible (active, fermée, inactive)
  const getTargetStatus = (target: CricketTarget) => {
    if (isTargetClosedByAll(target)) return 'closed';
    if (isTargetClosed(currentPlayer.id, target)) return 'inactive';
    return 'active';
  };

  const handleTargetClick = (target: CricketTarget) => {
    setSelectedTarget(target);
  };

  const handleMultiplierClick = (multiplier: number) => {
    setSelectedMultiplier(multiplier);
    if (selectedTarget !== null) {
      onScore(selectedTarget, multiplier);
      setSelectedTarget(null);
      setSelectedMultiplier(1);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cricket - {currentPlayer.username}'s turn</h2>
        <button
          onClick={() => setShowRules(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Show Rules
        </button>
      </div>

      {/* Score Board */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2">Player</th>
              {targets.map(target => (
                <th key={target} className="text-center p-2">{target}</th>
              ))}
              <th className="text-center p-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {gameState.players.map(player => (
              <tr 
                key={player.id}
                className={player.id === currentPlayer.id ? 'bg-blue-50' : ''}
              >
                <td className="p-2">{player.username}</td>
                {targets.map(target => {
                  const hits = player.scores[target]?.hits || 0;
                  const points = player.scores[target]?.points || 0;
                  return (
                    <td key={target} className="text-center p-2">
                      <div className="flex flex-col items-center">
                        <div className="flex gap-1 mb-1">
                          {Array.from({ length: 3 }, (_, i) => (
                            <span
                              key={i}
                              className={`inline-block w-2 h-2 rounded-full ${
                                i < hits ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        {points > 0 && (
                          <span className="text-sm text-gray-600">{points}</span>
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="text-center p-2 font-bold">{player.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Target Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {targets.map(target => {
          const status = getTargetStatus(target);
          const hits = currentPlayer.scores[target]?.hits || 0;
          return (
            <button
              key={target}
              onClick={() => handleTargetClick(target)}
              disabled={status === 'inactive' || status === 'closed'}
              className={`p-4 rounded-lg ${
                selectedTarget === target
                  ? 'bg-blue-500 text-white'
                  : status === 'active'
                  ? 'bg-green-100 hover:bg-green-200'
                  : status === 'inactive'
                  ? 'bg-yellow-100'
                  : 'bg-gray-100'
              }`}
            >
              <div className="font-bold">{target}</div>
              <div className="mt-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <span
                    key={i}
                    className={`inline-block w-2 h-2 mx-1 rounded-full ${
                      i < hits ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Multiplier Selection */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(multiplier => (
          <button
            key={multiplier}
            onClick={() => handleMultiplierClick(multiplier)}
            disabled={selectedTarget === null}
            className={`p-4 rounded-lg ${
              selectedMultiplier === multiplier && selectedTarget !== null
                ? 'bg-blue-500 text-white'
                : selectedTarget === null
                ? 'bg-gray-100'
                : 'bg-green-100 hover:bg-green-200'
            }`}
          >
            {multiplier}x
          </button>
        ))}
      </div>

      {showRules && <CricketRules isOpen={showRules} onClose={() => setShowRules(false)} />}
    </div>
  );
};

export default CricketBoard; 