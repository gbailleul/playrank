import React from 'react';
import { AroundTheClockPlayerState } from '../../types/variants/aroundTheClock/types';
import { AroundTheClockGameState } from '../../types/variants/aroundTheClock/types';

interface ScoreBoardProps {
  gameState: AroundTheClockGameState;
  currentPlayerIndex: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ gameState, currentPlayerIndex }) => {
  return (
    <div className="score-board">
      <table className="w-full">
        <thead>
          <tr>
            <th>Joueur</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {gameState.players.map((player: AroundTheClockPlayerState, index: number) => (
            <tr 
              key={player.id}
              className={index === currentPlayerIndex ? 'bg-primary/20' : ''}
            >
              <td>{player.username}</td>
              <td>{player.validatedCount}/20</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScoreBoard; 