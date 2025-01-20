import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameService } from '../../api/services';

interface Player {
  id: string;
  username: string;
  score: number;
  remaining?: number;
  isActive: boolean;
}

interface GameData {
  id: string;
  gameType: 'darts' | 'billiards';
  gameMode: string;
  players: Player[];
  status: 'active' | 'completed';
  winner?: string;
}

const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameData | null>(null);
  const [score, setScore] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchGameData();
    const interval = setInterval(fetchGameData, 5000); // Poll for updates
    return () => clearInterval(interval);
  }, [gameId]);

  const fetchGameData = async () => {
    try {
      const response = await gameService.getGame(gameId!);
      if (response.ok) {
        setGame(response.data);
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  };

  const handleScoreSubmit = async () => {
    if (!score || isNaN(Number(score))) {
      setError('Please enter a valid score');
      return;
    }

    try {
      const response = await gameService.addScore(gameId!, game!.id, {
        playerId: game!.players.find(p => p.isActive)!.id,
        points: Number(score),
        turnNumber: 1,
        isDouble: false
      });

      if (response.ok) {
        setScore('');
        setError('');
        fetchGameData();
      } else {
        const data = await response.json();
        setError(data.message || 'Error submitting score');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      setError('Error submitting score');
    }
  };

  const handleGameEnd = async (winnerId: string) => {
    try {
      await gameService.endSession(gameId!, game!.id, winnerId);
      navigate('/');
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  // ... rest of the component code ...
}; 