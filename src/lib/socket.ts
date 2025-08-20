import { io, Socket } from 'socket.io-client';

// Create a singleton socket instance
let socket: Socket | null = null;

// Get the WebSocket URL from environment or fallback to current origin
const getSocketUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use environment variable or current origin
    return process.env.NEXT_PUBLIC_WEBSOCKET_URL || window.location.origin;
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000';
};

// Initialize the socket connection
export const initializeSocket = (): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  const socketUrl = getSocketUrl();
  console.log('Initializing WebSocket connection to:', socketUrl);

  socket = io(socketUrl, {
    transports: ['websocket', 'polling'],
    autoConnect: false,
    withCredentials: true,
    timeout: 20000,
    forceNew: true,
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('WebSocket connected successfully');
  });

  socket.on('disconnect', (reason) => {
    console.log('WebSocket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  return socket;
};

// Get the socket instance
export const getSocket = (): Socket => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// Connect to the WebSocket server
export const connectSocket = (): void => {
  const socketInstance = getSocket();
  if (!socketInstance.connected) {
    socketInstance.connect();
  }
};

// Disconnect from the WebSocket server
export const disconnectSocket = (): void => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

// Authenticate the socket with user data
export const authenticateSocket = (userId: string, role: string): void => {
  const socketInstance = getSocket();
  if (socketInstance.connected) {
    socketInstance.emit('authenticate', { userId, role });
  }
};

// Join a room
export const joinRoom = (room: string): void => {
  const socketInstance = getSocket();
  if (socketInstance.connected) {
    socketInstance.emit('joinRoom', room);
  }
};

// Leave a room
export const leaveRoom = (room: string): void => {
  const socketInstance = getSocket();
  if (socketInstance.connected) {
    socketInstance.emit('leaveRoom', room);
  }
};

// Emit an event
export const emitEvent = (event: string, data: Record<string, unknown>): void => {
  const socketInstance = getSocket();
  if (socketInstance.connected) {
    socketInstance.emit(event, data);
  } else {
    console.warn('Socket not connected, cannot emit event:', event);
  }
};

// Listen to an event
export const onEvent = (event: string, callback: (data: Record<string, unknown>) => void): void => {
  const socketInstance = getSocket();
  socketInstance.on(event, callback);
};

// Remove event listener
export const offEvent = (event: string, callback?: (data: Record<string, unknown>) => void): void => {
  const socketInstance = getSocket();
  if (callback) {
    socketInstance.off(event, callback);
  } else {
    socketInstance.off(event);
  }
};

// Check if socket is connected
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

// Get socket connection status
export const getSocketStatus = () => {
  if (!socket) return 'disconnected';
  return socket.connected ? 'connected' : 'disconnected';
};

// Export the socket instance for direct access
export { socket }; 