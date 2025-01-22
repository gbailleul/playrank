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

    const baseUrl = import.meta.env.PROD
      ? 'https://playrank-api.onrender.com'
      : 'http://localhost:8000';

    console.log('Connecting to WebSocket at:', baseUrl);

    const socket = io(baseUrl, {
      auth: {
        token: localStorage.getItem('token'),
        gameId: game.id,
        userId: user.id
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('WebSocket connected successfully');
      setSocket(socket);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setSocket(null);
    });

    return () => {
      console.log('Cleaning up WebSocket connection');
      socket.disconnect();
      setSocket(null);
    };
  }, [game, user]);

  return socket;
}; 