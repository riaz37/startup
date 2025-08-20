import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3001; // Use port 3000 by default (Next.js convention)
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? ["http://localhost:3000", "http://localhost:3001"] : false,
      credentials: true,
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
  });

  // Store connected users
  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', (data) => {
      const { userId, role } = data;
      
      if (userId) {
        // Store user connection
        connectedUsers.set(socket.id, { userId, role, socketId: socket.id });
        
        // Join user to their personal room
        socket.join(`user:${userId}`);
        
        // Join admin room if user is admin
        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
          socket.join('admin');
        }
        
        // Emit user online event
        socket.broadcast.emit('user:online', { userId, timestamp: new Date().toISOString() });
        
        console.log(`User ${userId} (${role}) authenticated on socket ${socket.id}`);
      }
    });

    // Handle room joining
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    // Handle room leaving
    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room: ${room}`);
    });

    // Handle order events
    socket.on('order:created', (data) => {
      const { orderId, userId, status } = data;
      console.log(`Order created: ${orderId} for user ${userId}`);
      
      // Emit to specific user
      io.to(`user:${userId}`).emit('order:created', data);
      
      // Emit to admin room
      io.to('admin').emit('admin:orderUpdate', {
        orderId,
        action: 'created',
        adminId: 'system',
        level: 'info'
      });
    });

    socket.on('order:updated', (data) => {
      const { orderId, userId, status } = data;
      console.log(`Order updated: ${orderId} for user ${userId}`);
      
      // Emit to specific user
      io.to(`user:${userId}`).emit('order:updated', data);
      
      // Emit to admin room
      io.to('admin').emit('admin:orderUpdate', {
        orderId,
        action: 'updated',
        adminId: 'system',
        level: 'info'
      });
    });

    // Handle group order events
    socket.on('groupOrder:created', (data) => {
      const { groupOrderId, productName } = data;
      console.log(`Group order created: ${groupOrderId} for ${productName}`);
      
      // Emit to all users (could be filtered by interest)
      io.emit('groupOrder:created', data);
    });

    // Handle payment events
    socket.on('payment:success', (data) => {
      const { orderId, userId, amount } = data;
      console.log(`Payment success: ${orderId} for user ${userId}`);
      
      io.to(`user:${userId}`).emit('payment:success', data);
      io.to('admin').emit('admin:orderUpdate', {
        orderId,
        action: 'payment_success',
        adminId: 'system',
        level: 'info'
      });
    });

    // Handle analytics updates
    socket.on('analytics:update', (data) => {
      console.log('Analytics update:', data);
      io.to('admin').emit('analytics_update', data);
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      const userInfo = connectedUsers.get(socket.id);
      
      if (userInfo) {
        const { userId } = userInfo;
        
        // Emit user offline event
        socket.broadcast.emit('user:offline', { 
          userId, 
          timestamp: new Date().toISOString() 
        });
        
        // Remove from connected users
        connectedUsers.delete(socket.id);
        
        console.log(`User ${userId} disconnected: ${reason}`);
      } else {
        console.log(`Anonymous client disconnected: ${reason}`);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Health check endpoint
  httpServer.on('request', (req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        connections: io.engine.clientsCount,
        users: connectedUsers.size
      }));
    }
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> WebSocket server running on ws://${hostname}:${port}`);
      console.log(`> Health check available at http://${hostname}:${port}/health`);
    });
});