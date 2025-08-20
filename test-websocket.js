// Simple WebSocket test script
// Run this with: node test-websocket.js

import { io } from 'socket.io-client';

console.log('Testing WebSocket connection...');

// Connect to the WebSocket server
const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  timeout: 10000,
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
  console.log('Socket ID:', socket.id);
  
  // Test authentication
  socket.emit('authenticate', {
    userId: 'test-user-123',
    role: 'ADMIN'
  });
  
  // Test joining a room
  socket.emit('joinRoom', 'admin');
  
  // Send a test message
  socket.emit('order:created', {
    orderId: 'test-order-123',
    status: 'pending',
    userId: 'test-user-123'
  });
  
  // Test analytics update
  socket.emit('analytics:update', {
    type: 'test',
    message: 'Test analytics update from test script',
    timestamp: new Date().toISOString()
  });
  
  // Disconnect after 5 seconds
  setTimeout(() => {
    console.log('Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 5000);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

socket.on('user:online', (data) => {
  console.log('👤 User online event received:', data);
});

socket.on('order:created', (data) => {
  console.log('📦 Order created event received:', data);
});

socket.on('analytics_update', (data) => {
  console.log('📊 Analytics update event received:', data);
});

socket.on('admin:orderUpdate', (data) => {
  console.log('🔧 Admin order update event received:', data);
});

// Timeout after 15 seconds
setTimeout(() => {
  console.error('❌ Test timeout - server not responding');
  process.exit(1);
}, 15000);

console.log('Waiting for connection...'); 