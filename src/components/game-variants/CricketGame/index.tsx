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
}

export const CricketGame: React.FC<CricketGameProps> = ({
  session,
  gameState,
  activePlayerIndex,
  onScoreSubmit
}) => {
  const currentPlayer = session.players[activePlayerIndex];
  const currentPlayerId = currentPlayer.user?.id || currentPlayer.guestPlayer?.id || '';

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="w-full lg:w-1/3">
        <ScorePanel
          players={gameState.players}
          activePlayerId={currentPlayerId}
        />
      </div>
      <div className="w-full lg:w-2/3">
        <CricketDartBoard
          gameState={gameState}
          currentPlayerId={currentPlayerId}
          onScoreClick={onScoreSubmit}
          onTurnComplete={() => {}}
        />
      </div>
    </div>
  );
};

export default CricketGame; 