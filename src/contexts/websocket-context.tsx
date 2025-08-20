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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!session?.user?.id || socketRef.current?.connected) {
      return;
    }

    try {
      // Disconnect existing connection if any
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Connect to the external Socket.IO server
      const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || window.location.origin;
      console.log('Attempting to connect to WebSocket server:', socketUrl);
      
      const socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: false,
        withCredentials: true,
        timeout: 20000, // 20 second timeout
        forceNew: true,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setError(null);
        
        // Authenticate with the WebSocket server
        socket.emit('authenticate', {
          userId: session.user.id,
          role: session.user.role || 'USER'
        });
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        
        // Attempt to reconnect if not manually disconnected
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
          // Server or client initiated disconnect, don't auto-reconnect
          return;
        }
        
        // Auto-reconnect for other disconnect reasons
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setError(error);
        setIsConnected(false);
        
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        // Attempt to reconnect after error
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect after error...');
          connect();
        }, 5000);
      });

      // Listen for all incoming events
      socket.onAny((eventName, ...args) => {
        const message = {
          event: eventName,
          data: args[0] || {},
          timestamp: new Date().toISOString(),
        };
        setLastMessage(message);
        console.log('WebSocket message received:', message);
      });

      // Listen for specific events
      socket.on('user:online', (data) => {
        console.log('User online:', data);
      });

      socket.on('user:offline', (data) => {
        console.log('User offline:', data);
      });

      socket.on('order:created', (data) => {
        console.log('Order created:', data);
      });

      socket.on('order:updated', (data) => {
        console.log('Order updated:', data);
      });

      socket.on('notification:new', (data) => {
        console.log('New notification:', data);
      });

      // Connect the socket
      console.log('Initiating WebSocket connection...');
      socket.connect();
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setError(error as Error);
      setIsConnected(false);
    }
  }, [session]);

  const disconnect = useCallback(() => {
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

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
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }, []);

  const joinRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinRoom', room);
    } else {
      console.warn('Cannot join room: WebSocket not connected');
    }
  }, []);

  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveRoom', room);
    } else {
      console.warn('Cannot leave room: WebSocket not connected');
    }
  }, []);

  // Initialize WebSocket connection when session is available
  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    if (session?.user?.id && !isInitialized) {
      console.log('Session available, initializing WebSocket...');
      connect();
      setIsInitialized(true);
    } else if (!session?.user?.id && isInitialized) {
      console.log('Session lost, disconnecting WebSocket...');
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