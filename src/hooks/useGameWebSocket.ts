import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { User } from '../types/user';
import { Game } from '../types/base/game';
import { GameStatus } from '../types/game';
import { AroundTheClockScore } from '../types/variants/aroundTheClock/types';
import { CricketScore } from '../types/variants/cricket/types';

export interface GameUpdateEvent {
  type: 'score_update' | 'game_status_update';
  gameId: string;
  sessionId: string;
  playerId: string;
  score?: {
    players: Array<{
      id: string;
      username: string;
      scores: Array<{
        id: string;
        points: number;
        turnNumber: number;
        createdAt: string;
        isDouble?: boolean;
      }>;
      currentScore: number;
    }>;
    currentPlayerIndex: number;
    gameStatus: GameStatus;
    winner?: string;
  };
  cricketScore?: CricketScore;
  aroundTheClockScore?: AroundTheClockScore;
  status?: GameStatus;
}

export interface GameState {
  scores: Record<string, number>;
  status: GameStatus;
  currentPlayerIndex: number;
  winner?: string;
}

export const useGameWebSocket = (game: Game | null, user: User | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const handleGameUpdate = useCallback((event: GameUpdateEvent) => {
    console.log('Received game update:', event);
    
    if (event.type === 'score_update' && event.score) {
      const { players, currentPlayerIndex, gameStatus, winner } = event.score;
      
      // Convertir les scores des joueurs en Record<string, number>
      const scores: Record<string, number> = {};
      players.forEach(player => {
        scores[player.id] = player.currentScore;
      });

      setGameState({
        scores,
        status: gameStatus,
        currentPlayerIndex,
        winner
      });
    } else if (event.type === 'game_status_update' && event.status) {
      setGameState(prevState => prevState ? {
        ...prevState,
        status: event.status!
      } : null);
    }
  }, []);

  const connect = useCallback(() => {
    if (!game || !user) return null;

    const baseUrl = import.meta.env.PROD
      ? 'https://playrank-api.onrender.com'
      : 'http://localhost:8000';

    console.log('Connecting to WebSocket at:', baseUrl);

    const newSocket = io(baseUrl, {
      auth: {
        token: localStorage.getItem('token'),
        gameId: game.id,
        userId: user.id
      },
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket']
    });

    return newSocket;
  }, [game, user]);

  useEffect(() => {
    let currentSocket = socket;
    let mounted = true;

    const setupSocket = () => {
      if (!game || !user) {
        if (currentSocket) {
          console.log('Cleaning up existing socket');
          currentSocket.disconnect();
          if (mounted) {
            setSocket(null);
            setIsConnected(false);
          }
        }
        return;
      }

      if (!currentSocket) {
        currentSocket = connect();
        if (!currentSocket) return;

        currentSocket.on('connect', () => {
          console.log('WebSocket connected successfully');
          if (mounted) {
            setSocket(currentSocket);
            setIsConnected(true);
            reconnectAttempts.current = 0;
          }
        });

        currentSocket.on('game_update', handleGameUpdate);
        currentSocket.on('score_update', handleGameUpdate);

        currentSocket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          reconnectAttempts.current++;
          
          if (reconnectAttempts.current >= maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            currentSocket?.disconnect();
            if (mounted) {
              setSocket(null);
              setIsConnected(false);
            }
          }
        });

        currentSocket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          if (mounted) {
            setIsConnected(false);
          }
          
          if (reason === 'io server disconnect' || reason === 'io client disconnect') {
            // Ne pas tenter de se reconnecter si la déconnexion est volontaire
            if (mounted) {
              setSocket(null);
            }
          }
        });

        if (mounted) {
          setSocket(currentSocket);
        }
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      if (currentSocket) {
        console.log('Cleaning up WebSocket connection');
        currentSocket.off('game_update', handleGameUpdate);
        currentSocket.off('score_update', handleGameUpdate);
        currentSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [game, user, connect, handleGameUpdate]);

  const subscribe = useCallback((eventName: string, handler: (event: any) => void) => {
    if (!socket) return () => {};

    console.log(`Subscribing to ${eventName}`);
    socket.on(eventName, handler);
    return () => {
      console.log(`Unsubscribing from ${eventName}`);
      socket?.off(eventName, handler);
    };
  }, [socket]);

  const emit = useCallback((eventName: string, data: any) => {
    if (!socket || !isConnected) {
      console.warn('Cannot emit event: socket not connected');
      return;
    }
    console.log(`Emitting ${eventName}:`, data);
    socket.emit(eventName, data);
  }, [socket, isConnected]);

  return {
    socket,
    gameState,
    subscribe,
    emit,
    isConnected
  };
}; 