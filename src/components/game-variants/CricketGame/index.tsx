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
  console.log('CricketGame props:', { session, gameState, activePlayerIndex });
  
  const sessionPlayer = session.players[activePlayerIndex];
  const playerId = sessionPlayer.user?.id || sessionPlayer.guestPlayer?.id;
  
  console.log('Looking for player with ID:', playerId);
  
  const currentPlayer = gameState.players.find(p => p.id === playerId);

  console.log('Found currentPlayer:', currentPlayer);

  if (!currentPlayer) {
    console.log('No current player found, returning null');
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ScorePanel
        players={gameState.players}
        activePlayerIndex={activePlayerIndex}
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