import { websocketManager } from './websocket';
import { prisma } from './prisma';

// WebSocket Integration Service
export class WebSocketIntegrationService {
  private static instance: WebSocketIntegrationService;

  private constructor() {}

  public static getInstance(): WebSocketIntegrationService {
    if (!WebSocketIntegrationService.instance) {
      WebSocketIntegrationService.instance = new WebSocketIntegrationService();
    }
    return WebSocketIntegrationService.instance;
  }

  // Order-related WebSocket events
  async emitOrderCreated(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          groupOrder: {
            include: {
              product: true,
            },
          },
        },
      });

      if (order) {
        websocketManager.emitToUser(order.userId, 'order:created', {
          orderId: order.id,
          userId: order.userId,
          orderNumber: order.orderNumber,
        });

        // Notify admins
        websocketManager.emitToAdmins('admin:orderUpdate', {
          orderId: order.id,
          action: 'created',
          adminId: 'system',
        });
      }
    } catch (error) {
      console.error('Error emitting order created event:', error);
    }
  }

  async emitOrderUpdated(orderId: string, status: string, reason?: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
        },
      });

      if (order) {
        websocketManager.emitToUser(order.userId, 'order:updated', {
          orderId: order.id,
          status,
          userId: order.userId,
          reason,
        });

        // Notify admins
        websocketManager.emitToAdmins('admin:orderUpdate', {
          orderId: order.id,
          action: 'updated',
          adminId: 'system',
          status,
        });
      }
    } catch (error) {
      console.error('Error emitting order updated event:', error);
    }
  }

  async emitOrderCancelled(orderId: string, reason?: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
        },
      });

      if (order) {
        websocketManager.emitToUser(order.userId, 'order:cancelled', {
          orderId: order.id,
          userId: order.userId,
          reason,
        });

        // Notify admins
        websocketManager.emitToAdmins('admin:orderUpdate', {
          orderId: order.id,
          action: 'cancelled',
          adminId: 'system',
          reason,
        });
      }
    } catch (error) {
      console.error('Error emitting order cancelled event:', error);
    }
  }

  // Payment-related WebSocket events
  async emitPaymentSuccess(orderId: string, amount: number) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
        },
      });

      if (order) {
        websocketManager.emitToUser(order.userId, 'payment:success', {
          orderId: order.id,
          userId: order.userId,
          amount,
        });

        // Notify admins
        websocketManager.emitToAdmins('admin:orderUpdate', {
          orderId: order.id,
          action: 'payment_success',
          adminId: 'system',
          amount,
        });
      }
    } catch (error) {
      console.error('Error emitting payment success event:', error);
    }
  }

  async emitPaymentFailed(orderId: string, reason: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
        },
      });

      if (order) {
        websocketManager.emitToUser(order.userId, 'payment:failed', {
          orderId: order.id,
          userId: order.userId,
          reason,
        });

        // Notify admins
        websocketManager.emitToAdmins('admin:orderUpdate', {
          orderId: order.id,
          action: 'payment_failed',
          adminId: 'system',
          reason,
        });
      }
    } catch (error) {
      console.error('Error emitting payment failed event:', error);
    }
  }

  async emitPaymentRefunded(orderId: string, amount: number) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
        },
      });

      if (order) {
        websocketManager.emitToUser(order.userId, 'payment:refunded', {
          orderId: order.id,
          userId: order.userId,
          amount,
        });

        // Notify admins
        websocketManager.emitToAdmins('admin:orderUpdate', {
          orderId: order.id,
          action: 'payment_refunded',
          adminId: 'system',
          amount,
        });
      }
    } catch (error) {
      console.error('Error emitting payment refunded event:', error);
    }
  }

  // Group order-related WebSocket events
  async emitGroupOrderCreated(groupOrderId: string) {
    try {
      const groupOrder = await prisma.groupOrder.findUnique({
        where: { id: groupOrderId },
        include: {
          product: true,
        },
      });

      if (groupOrder) {
        // Emit to all users (public event)
        websocketManager.emitToAll('groupOrder:created', {
          groupOrderId: groupOrder.id,
          productName: groupOrder.product.name,
        });
      }
    } catch (error) {
      console.error('Error emitting group order created event:', error);
    }
  }

  async emitGroupOrderThresholdMet(groupOrderId: string) {
    try {
      const groupOrder = await prisma.groupOrder.findUnique({
        where: { id: groupOrderId },
        include: {
          product: true,
          orders: {
            include: {
              user: true,
            },
          },
        },
      });

      if (groupOrder) {
        const participants = groupOrder.orders.map(order => order.userId);

        // Emit to all participants
        participants.forEach(userId => {
          websocketManager.emitToUser(userId, 'groupOrder:thresholdMet', {
            groupOrderId: groupOrder.id,
            productName: groupOrder.product.name,
            participants,
          });
        });

        // Notify admins
        websocketManager.emitToAdmins('admin:orderUpdate', {
          groupOrderId: groupOrder.id,
          action: 'threshold_met',
          adminId: 'system',
          participantCount: participants.length,
        });
      }
    } catch (error) {
      console.error('Error emitting group order threshold met event:', error);
    }
  }

  async emitGroupOrderStatusChanged(groupOrderId: string, status: string) {
    try {
      const groupOrder = await prisma.groupOrder.findUnique({
        where: { id: groupOrderId },
        include: {
          product: true,
          orders: {
            include: {
              user: true,
            },
          },
        },
      });

      if (groupOrder) {
        const participants = groupOrder.orders.map(order => order.userId);

        // Emit to all participants
        participants.forEach(userId => {
          websocketManager.emitToUser(userId, 'groupOrder:statusChanged', {
            groupOrderId: groupOrder.id,
            status,
            productName: groupOrder.product.name,
          });
        });

        // Notify admins
        websocketManager.emitToAdmins('admin:orderUpdate', {
          groupOrderId: groupOrder.id,
          action: 'status_changed',
          adminId: 'system',
          status,
        });
      }
    } catch (error) {
      console.error('Error emitting group order status changed event:', error);
    }
  }

  // Delivery-related WebSocket events
  async emitDeliveryScheduled(deliveryId: string, orderId: string, userId: string, scheduledDate: string) {
    websocketManager.emitToUser(userId, 'delivery:scheduled', {
      deliveryId,
      orderId,
      userId,
      scheduledDate,
    });
  }

  async emitDeliveryInTransit(deliveryId: string, orderId: string, userId: string, trackingNumber?: string) {
    websocketManager.emitToUser(userId, 'delivery:inTransit', {
      deliveryId,
      orderId,
      userId,
      trackingNumber,
    });
  }

  async emitDeliveryCompleted(deliveryId: string, orderId: string, userId: string, deliveredAt: string) {
    websocketManager.emitToUser(userId, 'delivery:completed', {
      deliveryId,
      orderId,
      userId,
      deliveredAt,
    });
  }

  async emitDeliveryFailed(deliveryId: string, orderId: string, userId: string, reason: string) {
    websocketManager.emitToUser(userId, 'delivery:failed', {
      deliveryId,
      orderId,
      userId,
      reason,
    });
  }

  // Notification-related WebSocket events
  async emitNewNotification(notificationId: string, userId: string, title: string, message: string) {
    websocketManager.emitToUser(userId, 'notification:new', {
      notificationId,
      userId,
      title,
      message,
    });
  }

  async emitNotificationRead(notificationId: string, userId: string) {
    websocketManager.emitToUser(userId, 'notification:read', {
      notificationId,
      userId,
    });
  }

  // Admin-related WebSocket events
  emitSystemAlert(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    websocketManager.emitToAdmins('admin:systemAlert', {
      message,
      level,
    });
  }

  // User presence events
  emitUserOnline(userId: string) {
    websocketManager.emitToAll('user:online', {
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  emitUserOffline(userId: string) {
    websocketManager.emitToAll('user:offline', {
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  // Utility methods
  getConnectedUsersCount(): number {
    return websocketManager.getConnectedUsersCount();
  }

  getConnectedAdminsCount(): number {
    return websocketManager.getConnectedAdminsCount();
  }

  isUserOnline(userId: string): boolean {
    return websocketManager.isUserOnline(userId);
  }

  getOnlineUsers(): string[] {
    return websocketManager.getOnlineUsers();
  }
}

// Export singleton instance
export const websocketIntegration = WebSocketIntegrationService.getInstance(); 