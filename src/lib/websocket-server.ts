import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { websocketManager } from './websocket';

// Create HTTP server
const httpServer = createServer();

// Initialize WebSocket manager with the HTTP server
websocketManager.initialize(httpServer);

// Export the server for use in different contexts
export { httpServer };

// If running as standalone server
if (require.main === module) {
  const PORT = process.env.WEBSOCKET_PORT || 3001;
  
  httpServer.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
}); 