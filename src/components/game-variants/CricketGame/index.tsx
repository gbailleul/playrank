import React from 'react';
import { GameSession } from '../../../types/base/game';
import { CricketGameState, CricketThrow } from '../../../types/variants/cricket/types';
import CricketDartBoard from '../../molecules/CricketDartBoard';
import ScorePanel from './ScorePanel';

interface CricketGameProps {
  session: GameSession;
  gameState: CricketGameState;
  activePlayerIndex: number;
  onScoreSubmit: (throws: CricketThrow[]) => Promise<void>;
  onTurnComplete: () => void;
}

export const CricketGame: React.FC<CricketGameProps> = ({
  session,
  gameState,
  activePlayerIndex,
  onScoreSubmit,
  onTurnComplete,
}) => {
  const currentPlayer = gameState.players.find(
    p => p.id === session.players[activePlayerIndex].playerId
  );

  if (!currentPlayer) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ScorePanel
        players={gameState.players}
        activePlayerId={currentPlayer.id}
      />
      <div className="mt-8">
        <CricketDartBoard
          gameState={gameState}
          onScoreClick={onScoreSubmit}
          currentPlayerId={currentPlayer.id}
          onTurnComplete={onTurnComplete}
        />
      </div>
    </div>
  );
}; 