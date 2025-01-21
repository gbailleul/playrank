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
    console.log('Invalid session or player index:', { 
      sessionPlayers: session.players, 
      activePlayerIndex 
    });
    return null;
  }

  const sessionPlayer = session.players[activePlayerIndex];
  if (!sessionPlayer) {
    console.log('Session player not found:', { activePlayerIndex });
    return null;
  }

  const playerId = sessionPlayer.user?.id || sessionPlayer.guestPlayer?.id;
  if (!playerId) {
    console.log('No player ID found:', { sessionPlayer });
    return null;
  }

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  if (!currentPlayer) {
    console.log('Player not found:', { 
      sessionPlayer, 
      playerId, 
      gameStatePlayers: gameState.players 
    });
    return null;
  }

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