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
  // Vérifier que session.players existe et que l'index est valide
  if (!session.players || activePlayerIndex >= session.players.length) {
    return null;
  }

  const sessionPlayer = session.players[activePlayerIndex];
  if (!sessionPlayer) {
    return null;
  }

  const playerId = sessionPlayer.user?.id || sessionPlayer.guestPlayer?.id;
  if (!playerId) {
    return null;
  }

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  if (!currentPlayer) {
    return null;
  }

  const handleScoreSubmit = async (points: number) => {
    if (!session || activePlayerIndex === undefined) {
      return;
    }

    const sessionPlayer = session.players[activePlayerIndex];
    if (!sessionPlayer) {
      return;
    }

    const playerId = sessionPlayer.user?.id || sessionPlayer.guestPlayer?.id;
    if (!playerId) {
      return;
    }

    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return;
    }

    await onScoreSubmit(points, false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ScorePanel
        session={session}
        gameState={gameState}
        activePlayerIndex={activePlayerIndex}
      />
      <div className="mt-8 w-full max-w-md mx-auto">
        <DartBoard onScoreSelect={handleScoreSubmit} />
      </div>
    </div>
  );
}; 