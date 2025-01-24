import React from 'react';
import CricketDartBoard from '../../molecules/CricketDartBoard';
import ScorePanel from './ScorePanel';
import { CricketGameState, CricketThrow } from '../../../types/variants/cricket/types';
import { GameSession } from '../../../types/base/game';
import { GameStatus } from '../../../types/game';
import VictoryModal from '../../shared/VictoryModal';

interface CricketGameProps {
  session: GameSession;
  gameState: CricketGameState;
  activePlayerIndex: number;
  onScoreSubmit: (throws: CricketThrow[]) => Promise<void>;
}

const CricketGame: React.FC<CricketGameProps> = ({
  session,
  gameState,
  activePlayerIndex,
  onScoreSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showVictoryModal, setShowVictoryModal] = React.useState(false);

  const currentPlayer = session.players[activePlayerIndex];
  const currentPlayerId = currentPlayer.user?.id || currentPlayer.guestPlayer?.id || '';

  React.useEffect(() => {
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

  const handleScoreClick = async (throws: Array<{ target: number; multiplier: number }>) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onScoreSubmit(throws as CricketThrow[]);
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vérifie si la session est valide et a des joueurs
  if (!session || !session.players || session.players.length === 0) {
    return (
      <div className="text-center text-[var(--text-primary)]">
        Session invalide ou aucun joueur
      </div>
    );
  }

  const winningPlayer = gameState.winner ? session.players.find(p => 
    p.user?.id === gameState.winner || p.guestPlayer?.id === gameState.winner
  ) : null;

  return (
    <>
      <div className="flex flex-col md:flex-row gap-8 p-4">
        <div className="flex-1">
          <ScorePanel
            gameState={gameState}
            activePlayerIndex={activePlayerIndex}
          />
        </div>
        <div className="flex-1">
          <CricketDartBoard
            gameState={gameState}
            currentPlayerId={currentPlayerId}
            onScoreClick={handleScoreClick}
            onTurnComplete={() => {}}
          />
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

export default CricketGame; 