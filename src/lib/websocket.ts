import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from './prisma';

export interface WebSocketEvents {
  // Order events
  'order:created': (data: { orderId: string; userId: string; orderNumber: string }) => void;
  'order:updated': (data: { orderId: string; status: string; userId: string }) => void;
  'order:cancelled': (data: { orderId: string; userId: string; reason?: string }) => void;
  
  // Group order events
  'groupOrder:created': (data: { groupOrderId: string; productName: string }) => void;
  'groupOrder:thresholdMet': (data: { groupOrderId: string; productName: string; participants: string[] }) => void;
  'groupOrder:statusChanged': (data: { groupOrderId: string; status: string; productName: string }) => void;
  
  // Payment events
  'payment:success': (data: { orderId: string; userId: string; amount: number }) => void;
  'payment:failed': (data: { orderId: string; userId: string; reason: string }) => void;
  'payment:refunded': (data: { orderId: string; userId: string; amount: number }) => void;
  
  // Delivery events
  'delivery:scheduled': (data: { deliveryId: string; orderId: string; userId: string; scheduledDate: string }) => void;
  'delivery:inTransit': (data: { deliveryId: string; orderId: string; userId: string; trackingNumber?: string }) => void;
  'delivery:completed': (data: { deliveryId: string; orderId: string; userId: string; deliveredAt: string }) => void;
  'delivery:failed': (data: { deliveryId: string; orderId: string; userId: string; reason: string }) => void;
  
  // Notification events
  'notification:new': (data: { notificationId: string; userId: string; title: string; message: string }) => void;
  'notification:read': (data: { notificationId: string; userId: string }) => void;
  
  // User events
  'user:online': (data: { userId: string; timestamp: string }) => void;
  'user:offline': (data: { userId: string; timestamp: string }) => void;
  
  // Admin events
  'admin:orderUpdate': (data: { orderId: string; action: string; adminId: string }) => void;
  'admin:systemAlert': (data: { message: string; level: 'info' | 'warning' | 'error' }) => void;
}

export interface WebSocketData {
  // Order data
  orderId?: string;
  userId?: string;
  orderNumber?: string;
  status?: string;
  reason?: string;
  
  // Group order data
  groupOrderId?: string;
  productName?: string;
  participants?: string[];
  
  // Payment data
  amount?: number;
  
  // Delivery data
  deliveryId?: string;
  scheduledDate?: string;
  trackingNumber?: string;
  deliveredAt?: string;
  
  // Notification data
  notificationId?: string;
  title?: string;
  message?: string;
  
  // Admin data
  adminId?: string;
  action?: string;
  level?: 'info' | 'warning' | 'error';
  
  // Timestamp
  timestamp?: string;
}

class WebSocketManager {
  private io: SocketIOServer | null = null;
  private userSockets = new Map<string, string>(); // userId -> socketId
  private adminSockets = new Set<string>(); // socketIds of admin users

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
    console.log('WebSocket server initialized');
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', async (data: { userId: string; role: string }) => {
        try {
          // Verify user exists
          const user = await prisma.user.findUnique({
            where: { id: data.userId },
            select: { id: true, role: true },
          });

          if (user) {
            // Store user socket mapping
            this.userSockets.set(data.userId, socket.id);
            
            // Join user-specific room
            socket.join(`user:${data.userId}`);
            
            // Join admin room if user is admin
            if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
              socket.join('admin');
              this.adminSockets.add(socket.id);
            }

            // Emit user online event
            this.emitToUser(data.userId, 'user:online', {
              userId: data.userId,
              timestamp: new Date().toISOString(),
            });

            console.log(`User authenticated: ${data.userId} (${user.role})`);
          }
        } catch (error) {
          console.error('Authentication error:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        // Find and remove user from mappings
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            this.emitToUser(userId, 'user:offline', {
              userId,
              timestamp: new Date().toISOString(),
            });
            break;
          }
        }

        // Remove from admin sockets
        this.adminSockets.delete(socket.id);
      });

      // Handle custom events
      socket.on('joinRoom', (room: string) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
      });

      socket.on('leaveRoom', (room: string) => {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room: ${room}`);
      });
    });
  }

  // Emit to specific user
  emitToUser(userId: string, event: keyof WebSocketEvents, data: WebSocketData) {
    if (!this.io) return;

    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Emit to all users
  emitToAll(event: keyof WebSocketEvents, data: WebSocketData) {
    if (!this.io) return;

    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Emit to admin users only
  emitToAdmins(event: keyof WebSocketEvents, data: WebSocketData) {
    if (!this.io) return;

    this.io.to('admin').emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Emit to specific room
  emitToRoom(room: string, event: keyof WebSocketEvents, data: WebSocketData) {
    if (!this.io) return;

    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast to all except sender
  broadcastToOthers(socketId: string, event: keyof WebSocketEvents, data: WebSocketData) {
    if (!this.io) return;

    this.io.except(socketId).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Get connected admins count
  getConnectedAdminsCount(): number {
    return this.adminSockets.size;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Get all online users
  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }
}

// Export singleton instance
export const websocketManager = new WebSocketManager();

// Helper functions for common events
export const emitOrderUpdate = (orderId: string, userId: string, status: string) => {
  websocketManager.emitToUser(userId, 'order:updated', {
    orderId,
    userId,
    status,
  });
};

export const emitPaymentSuccess = (orderId: string, userId: string, amount: number) => {
  websocketManager.emitToUser(userId, 'payment:success', {
    orderId,
    userId,
    amount,
  });
};

export const emitGroupOrderThresholdMet = (groupOrderId: string, productName: string, participants: string[]) => {
  // Emit to all participants
  participants.forEach(userId => {
    websocketManager.emitToUser(userId, 'groupOrder:thresholdMet', {
      groupOrderId,
      productName,
      participants,
    });
  });
};

export const emitNewNotification = (notificationId: string, userId: string, title: string, message: string) => {
  websocketManager.emitToUser(userId, 'notification:new', {
    notificationId,
    userId,
    title,
    message,
  });
};

export const emitDeliveryUpdate = (deliveryId: string, orderId: string, userId: string, status: string, additionalData?: Partial<WebSocketData>) => {
  const eventMap = {
    'SCHEDULED': 'delivery:scheduled',
    'IN_TRANSIT': 'delivery:inTransit',
    'COMPLETED': 'delivery:completed',
    'FAILED': 'delivery:failed',
  } as const;

  const event = eventMap[status as keyof typeof eventMap];
  if (event) {
    websocketManager.emitToUser(userId, event, {
      deliveryId,
      orderId,
      userId,
      ...additionalData,
    });
  }
}; 