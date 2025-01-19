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
    if (!game?.id) return;

    const baseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:8000';
    
    console.log('Tentative de connexion Socket.IO à:', baseUrl);
    
    const newSocket = io(baseUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connecté avec succès');
      newSocket.emit('join_game', {
        gameId: game.id,
        playerId: user?.id
      });
    });

    setSocket(newSocket);
    
    return () => {
      console.log('Nettoyage de la connexion Socket.IO');
      if (game.id && user?.id) {
        newSocket.emit('leave_game', {
          gameId: game.id,
          playerId: user.id
        });
      }
      newSocket.disconnect();
    };
  }, [game?.id, user?.id]);

  return socket;
}; 