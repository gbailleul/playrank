import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AroundTheClockGameState, AroundTheClockThrow } from '../../../types/variants/aroundTheClock/types';
import AroundTheClockDartBoard from '../../molecules/AroundTheClockDartBoard';
import ScorePanel from '../../../components/game-variants/AroundTheClockGame/ScorePanel';
import GameEndDialog from '../../../components/shared/GameEndDialog';
import { GameStatus } from '../../../types/game';

interface AroundTheClockGameProps {
  gameState: AroundTheClockGameState;
  activePlayerIndex: number;
  onScoreSubmit: (throws: AroundTheClockThrow[]) => Promise<void>;
}

const AroundTheClockGame: React.FC<AroundTheClockGameProps> = ({
  gameState,
  activePlayerIndex,
  onScoreSubmit
}) => {
  const navigate = useNavigate();
  const [showEndDialog, setShowEndDialog] = useState(false);
  const currentPlayer = gameState.players[activePlayerIndex];

  useEffect(() => {
    // Afficher la modal de fin quand le jeu est terminé
    if (gameState.status === GameStatus.COMPLETED && gameState.winner) {
      setShowEndDialog(true);
    }
  }, [gameState.status, gameState.winner]);

  if (!currentPlayer) return null;

  const winner = gameState.status === GameStatus.COMPLETED ? 
    gameState.players.find(p => p.id === gameState.winner) : undefined;

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
            onTurnComplete={() => {}}
            validatedNumbers={Array.isArray(currentPlayer.validatedNumbers) ? currentPlayer.validatedNumbers : []}
          />
        </div>
      </div>

      {showEndDialog && winner && (
        <GameEndDialog
          isOpen={true}
          winner={winner.username}
          onClose={() => {
            setShowEndDialog(false);
            navigate('/dashboard');
          }}
          stats={{
            totalThrows: winner.totalThrows,
            validatedCount: winner.validatedCount
          }}
        />
      )}
    </>
  );
};

export default AroundTheClockGame; 