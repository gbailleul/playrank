import React from 'react';
import { GameSession } from '../../../types/base/game';
import { ClassicGameState } from '../../../types/variants/classic/types';
import DartBoard from '../../molecules/DartBoard';
import ScorePanel from '../../../components/game-variants/ClassicGame/ScorePanel';

interface ClassicGameProps {
  session: GameSession;
  gameState: ClassicGameState;
  activePlayerIndex: number;
  onScoreSubmit: (score: number, isDouble: boolean) => Promise<void>;
}

export const ClassicGame: React.FC<ClassicGameProps> = ({
  session,
  gameState,
  activePlayerIndex,
  onScoreSubmit,
}) => {
  const currentPlayer = gameState.players.find(
    p => p.id === session.players[activePlayerIndex].playerId
  );

  if (!currentPlayer) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ScorePanel
        session={session}
        gameState={gameState}
        activePlayerIndex={activePlayerIndex}
      />
      <div className="mt-8 w-full max-w-md mx-auto">
        <DartBoard onScoreSelect={onScoreSubmit} />
      </div>
    </div>
  );
}; 