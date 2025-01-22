import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { User } from '../types/user';
import { Game } from '../types/base/game';
import { AroundTheClockScore } from '../types/variants/aroundTheClock/types';
import { CricketScore } from '../types/variants/cricket/types';

export interface GameUpdateEvent {
  type: 'score_update' | 'game_status_update';
  gameId: string;
  sessionId: string;
  playerId: string;
  score?: any;
  cricketScore?: CricketScore;
  aroundTheClockScore?: AroundTheClockScore;
  status?: string;
}

export const useGameWebSocket = (game: Game | null, user: User | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!game || !user) return;

    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://playrank-api.onrender.com'
      : 'http://localhost:3000';

    const socket = io(baseUrl, {
      auth: {
        token: localStorage.getItem('token'),
        gameId: game.id,
        userId: user.id
      }
    });

    socket.on('connect', () => {
      setSocket(socket);
    });

    return () => {
      socket.disconnect();
      setSocket(null);
    };
  }, [game, user]);

  return socket;
}; 