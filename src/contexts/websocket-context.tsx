"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/hooks/use-websocket';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
  error: Error | null;
  sendMessage: (event: string, data: any) => void;
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

  const {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    joinRoom,
    leaveRoom,
    connect,
    disconnect,
  } = useWebSocket({
    autoConnect: false, // We'll control connection manually
    onConnect: () => {
      console.log('WebSocket connected via context');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected via context');
    },
    onError: (error) => {
      console.error('WebSocket error via context:', error);
    },
  });

  // Initialize WebSocket connection when session is available
  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    if (session?.user?.id && !isInitialized) {
      connect();
      setIsInitialized(true);
    } else if (!session?.user?.id && isInitialized) {
      disconnect();
      setIsInitialized(false);
    }
  }, [session, status, isInitialized, connect, disconnect]);

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