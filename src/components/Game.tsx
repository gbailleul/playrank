import React, { useState } from 'react';
import CricketBoard from './CricketBoard';
import { CricketGameState, CricketHit } from '../types/cricket';
import DartBoard from './molecules/DartBoard';
import { Player } from '../types/index';

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<CricketGameState>({
    players: [],
    currentPlayerIndex: 0,
    gameStatus: 'IN_PROGRESS',
  });

  const [gameType, setGameType] = useState<'CRICKET' | '301' | '501'>('CRICKET');

  const players = gameState.players;
  const currentPlayer = players[gameState.currentPlayerIndex];

  const handleCricketScore = (hit: CricketHit) => {
    // Logique pour mettre à jour le score du Cricket
    const { target, multiplier, playerId } = hit;
    setGameState((prevState) => {
      const newPlayers = prevState.players.map((player) => {
        if (player.id === playerId) {
          const newScores = { ...player.scores };
          newScores[target].hits += multiplier;
          if (newScores[target].hits > 3) {
            newScores[target].hits = 3;
          }
          return {
            ...player,
            scores: newScores,
            totalPoints: player.totalPoints + (newScores[target].hits > 3 ? 0 : target * multiplier),
          };
        }
        return player;
      });
      return {
        ...prevState,
        players: newPlayers,
      };
    });
  };

  const handleScore = (score: number) => {
    // Logique pour gérer le score pour 301 et 501
  };

  return (
    <div>
      {gameType === 'CRICKET' ? (
        <CricketBoard 
          gameState={gameState as CricketGameState}
          onScore={handleCricketScore}
        />
      ) : (
        <DartBoard 
          onScoreSelect={handleScore}
          disabled={gameState.gameStatus !== 'IN_PROGRESS'}
        />
      )}
    </div>
  );
};

export default Game; 