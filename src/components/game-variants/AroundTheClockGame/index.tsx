import React from 'react';
import { GameSession } from '../../../types/base/game';
import { AroundTheClockGameState, AroundTheClockThrow } from '../../../types/variants/aroundTheClock/types';
import AroundTheClockDartBoard from '../../molecules/AroundTheClockDartBoard';
import ScorePanel from '../../../components/game-variants/AroundTheClockGame/ScorePanel';
import GameEndDialog from '../../../components/shared/GameEndDialog';

interface AroundTheClockGameProps {
  session: GameSession;
  gameState: AroundTheClockGameState;
  activePlayerIndex: number;
  onScoreSubmit: (throws: AroundTheClockThrow[]) => Promise<void>;
  onTurnComplete?: () => void;
}

export const AroundTheClockGame: React.FC<AroundTheClockGameProps> = ({
  session,
  gameState,
  activePlayerIndex,
  onScoreSubmit,
  onTurnComplete,
}) => {
  const currentPlayer = gameState.players[activePlayerIndex];

  if (!currentPlayer) return null;

  const winner = gameState.status === 'COMPLETED' ? gameState.players.find(p => p.id === gameState.winner) : undefined;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScorePanel
          players={gameState.players}
          activePlayerId={currentPlayer.id}
        />
        <div className="mt-8">
          <AroundTheClockDartBoard
            currentNumber={currentPlayer.currentNumber}
            playerId={currentPlayer.id}
            onScoreClick={onScoreSubmit}
            onTurnComplete={onTurnComplete}
          />
        </div>
      </div>

      {winner && (
        <GameEndDialog
          isOpen={true}
          winner={winner.username}
          onClose={() => {}}
          stats={{
            totalThrows: winner.totalThrows,
            validatedCount: winner.validatedCount
          }}
        />
      )}
    </>
  );
}; 