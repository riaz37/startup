// WebSocket helper functions for external Socket.IO server communication
// The actual Socket.IO server runs separately via server.js

export interface WebSocketEvents {
  // Order events
  'order:created': (data: { orderId: string; status: string; userId: string }) => void;
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

// Helper functions for external Socket.IO server communication
// These functions will be called from your API routes to emit events

export const emitOrderUpdate = (orderId: string, userId: string, status: string) => {
  // This will be handled by the external Socket.IO server
  console.log(`Order update event: ${orderId} - ${status} for user ${userId}`);
};

export const emitPaymentSuccess = (orderId: string, userId: string, amount: number) => {
  console.log(`Payment success event: ${orderId} - ${amount} for user ${userId}`);
};

export const emitPaymentFailed = (orderId: string, userId: string, reason: string) => {
  console.log(`Payment failed event: ${orderId} - ${reason} for user ${userId}`);
};

export const emitGroupOrderUpdate = (groupOrderId: string, status: string, productName: string) => {
  console.log(`Group order update event: ${groupOrderId} - ${status} for ${productName}`);
};

export const emitNotification = (userId: string, title: string, message: string) => {
  console.log(`Notification event: ${title} for user ${userId}`);
};

export const emitDeliveryUpdate = (deliveryId: string, orderId: string, userId: string, status: string) => {
  console.log(`Delivery update event: ${deliveryId} - ${status} for order ${orderId}`);
};

// Export the WebSocket context hook for easy access
export { useWebSocketContext } from '@/contexts/websocket-context'; 