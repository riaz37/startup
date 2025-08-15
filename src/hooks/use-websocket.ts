"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const {
    autoConnect = true,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  // Initialize socket connection
  const connect = useCallback(() => {
    if (!session?.user?.id) return;

    try {
      const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000', {
        transports: ['websocket', 'polling'],
        autoConnect: false,
        withCredentials: true,
      });

      // Set up event listeners
      socket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        
        // Authenticate with the server
        socket.emit('authenticate', {
          userId: session.user.id,
          role: session.user.role || 'CUSTOMER',
        });
        
        onConnect?.();
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();
      });

      socket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err);
        setError(err);
        setIsConnected(false);
        onError?.(err);
      });

      // Handle incoming messages
      socket.on('order:created', (data) => {
        const message: WebSocketMessage = {
          type: 'order:created',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('order:updated', (data) => {
        const message: WebSocketMessage = {
          type: 'order:updated',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('order:cancelled', (data) => {
        const message: WebSocketMessage = {
          type: 'order:cancelled',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('groupOrder:created', (data) => {
        const message: WebSocketMessage = {
          type: 'groupOrder:created',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('groupOrder:thresholdMet', (data) => {
        const message: WebSocketMessage = {
          type: 'groupOrder:thresholdMet',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('groupOrder:statusChanged', (data) => {
        const message: WebSocketMessage = {
          type: 'groupOrder:statusChanged',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('payment:success', (data) => {
        const message: WebSocketMessage = {
          type: 'payment:success',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('payment:failed', (data) => {
        const message: WebSocketMessage = {
          type: 'payment:failed',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('payment:refunded', (data) => {
        const message: WebSocketMessage = {
          type: 'payment:refunded',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('delivery:scheduled', (data) => {
        const message: WebSocketMessage = {
          type: 'delivery:scheduled',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('delivery:inTransit', (data) => {
        const message: WebSocketMessage = {
          type: 'delivery:inTransit',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('delivery:completed', (data) => {
        const message: WebSocketMessage = {
          type: 'delivery:completed',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('delivery:failed', (data) => {
        const message: WebSocketMessage = {
          type: 'delivery:failed',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('notification:new', (data) => {
        const message: WebSocketMessage = {
          type: 'notification:new',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      socket.on('notification:read', (data) => {
        const message: WebSocketMessage = {
          type: 'notification:read',
          data,
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        onMessage?.(message);
      });

      // Admin-specific events
      if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
        socket.on('admin:orderUpdate', (data) => {
          const message: WebSocketMessage = {
            type: 'admin:orderUpdate',
            data,
            timestamp: new Date().toISOString(),
          };
          setLastMessage(message);
          onMessage?.(message);
        });

        socket.on('admin:systemAlert', (data) => {
          const message: WebSocketMessage = {
            type: 'admin:systemAlert',
            data,
            timestamp: new Date().toISOString(),
          };
          setLastMessage(message);
          onMessage?.(message);
        });
      }

      socketRef.current = socket;

      if (autoConnect) {
        socket.connect();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize WebSocket');
      setError(error);
      onError?.(error);
    }
  }, [session?.user?.id, session?.user?.role, autoConnect, onConnect, onDisconnect, onError, onMessage]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback((event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  }, [isConnected]);

  // Join room
  const joinRoom = useCallback((room: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('joinRoom', room);
    }
  }, [isConnected]);

  // Leave room
  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leaveRoom', room);
    }
  }, [isConnected]);

  // Connect effect
  useEffect(() => {
    if (session?.user?.id && autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [session?.user?.id, autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
    joinRoom,
    leaveRoom,
    socket: socketRef.current,
  };
} 