import React, { useState, useEffect } from 'react';
import { GameSession } from '../../../types/base/game';
import { ClassicGameState } from '../../../types/variants/classic/types';
import DartBoard from '../../molecules/DartBoard';
import ScorePanel from '../../../components/game-variants/ClassicGame/ScorePanel';
import VictoryModal from '../../shared/VictoryModal';
import { GameStatus } from '../../../types/game';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

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

  useEffect(() => {
    // Afficher la modal de victoire quand le jeu est terminé
    if (gameState.gameStatus === GameStatus.COMPLETED && gameState.winner) {
      const winningPlayer = session.players.find(p => 
        p.user?.id === gameState.winner || p.guestPlayer?.id === gameState.winner
      );
      if (winningPlayer) {
        setShowVictoryModal(true);
      }
    }
  }, [gameState.gameStatus, gameState.winner, session.players]);

  const handleScoreSubmit = async (points: number, isDouble: boolean = false) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onScoreSubmit(points, isDouble);
    } finally {
      setIsSubmitting(false);
    }
  };

  const winningPlayer = gameState.winner ? session.players.find(p => 
    p.user?.id === gameState.winner || p.guestPlayer?.id === gameState.winner
  ) : null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScorePanel
          gameState={gameState}
          activePlayerIndex={activePlayerIndex}
        />
        <div className="mt-8 w-full max-w-md mx-auto">
          <DartBoard onScoreSelect={handleScoreSubmit} />
        </div>
      </div>

      {showVictoryModal && winningPlayer && (
        <VictoryModal
          winner={{
            id: gameState.winner!,
            username: winningPlayer.user?.username || winningPlayer.guestPlayer?.name || 'Unknown'
          }}
          onClose={() => setShowVictoryModal(false)}
        />
      )}
    </>
  );
}; 