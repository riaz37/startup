"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: Record<string, unknown> | null;
  error: Error | null;
  sendMessage: (event: string, data: Record<string, unknown>) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { data: session, status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Record<string, unknown> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (!session?.user?.id || socketRef.current?.connected) {
      return;
    }

    try {
      const socket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL || window.location.origin}/api/socket`, {
        transports: ['websocket', 'polling'],
        autoConnect: false,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        setError(null);
        
        // Authenticate with the WebSocket server
        socket.emit('authenticate', {
          userId: session.user.id,
          role: session.user.role || 'USER'
        });
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        setError(error);
        setIsConnected(false);
      });

      // Listen for all incoming events
      socket.onAny((eventName, ...args) => {
        const message = {
          event: eventName,
          data: args[0] || {},
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
      });

      socket.connect();
    } catch (error) {
      setError(error as Error);
      setIsConnected(false);
    }
  }, [session]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setLastMessage(null);
    setError(null);
  }, []);

  const sendMessage = useCallback((event: string, data: Record<string, unknown>) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const joinRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinRoom', room);
    }
  }, []);

  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveRoom', room);
    }
  }, []);

  // Initialize WebSocket connection when session is available
  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    if (session?.user?.id && !isInitialized) {
      connect();
      setIsInitialized(true);
      
      // Authenticate with the WebSocket server
      setTimeout(() => {
        if (isConnected) {
          sendMessage('authenticate', {
            userId: session.user.id,
            role: session.user.role || 'USER'
          });
        }
      }, 1000);
    } else if (!session?.user?.id && isInitialized) {
      disconnect();
      setIsInitialized(false);
    }
  }, [session, status, isInitialized, connect, disconnect, isConnected, sendMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        disconnect();
      }
    };
  }, [isInitialized, disconnect]);

  const value: WebSocketContextType = {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    joinRoom,
    leaveRoom,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

// Hook for components that need WebSocket but don't need the full context
export function useWebSocketConnection() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    return {
      isConnected: false,
      error: null,
    };
  }
  return {
    isConnected: context.isConnected,
    error: context.error,
  };
} 