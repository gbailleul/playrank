import React, { useState, useEffect } from 'react';
import { Game as GameType } from '../../types/base/game';
import { gameService } from '../../api/services';
import { PlayerGame } from '../../types/base/player';

type GameData = GameType & {
  players: PlayerGame[];
  status: string;
};

interface GameProps {
  onScoreSubmit?: (playerId: string, points: number, turnNumber: number) => Promise<void>;
  activePlayerIndex: number;
  onPlayerChange?: (index: number) => void;
}

const Game: React.FC<GameProps> = ({ onScoreSubmit, activePlayerIndex, onPlayerChange }) => {
  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await gameService.getGame('game-id');
        const gameData = response.data;
        if (gameData) {
          setGame(gameData as GameData);
        }
      } catch (err) {
        setError('Failed to fetch game');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!game) return null;

  return (
    <div>
      <div>Current Player: {activePlayerIndex + 1}</div>
      <button onClick={() => onPlayerChange?.((activePlayerIndex + 1) % (game.players.length || 1))}>
        Next Player
      </button>
      <button onClick={() => onScoreSubmit?.(game.players[activePlayerIndex].playerId, 0, 1)}>
        Submit Score
      </button>
    </div>
  );
};

export default Game; 