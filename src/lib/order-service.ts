import { prisma } from './prisma';
import { emailService } from './email-service';
import { GroupOrderStatus, OrderStatus } from '@/generated/prisma';

export class OrderService {
  private static instance: OrderService;

  private constructor() {}

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  // Check if group order threshold is met
  async checkGroupOrderThreshold(groupOrderId: string) {
    try {
      const groupOrder = await prisma.groupOrder.findUnique({
        where: { id: groupOrderId },
        include: {
          orders: {
            include: {
              user: true,
            },
          },
          product: true,
        },
      });

      if (!groupOrder) {
        throw new Error('Group order not found');
      }

      const currentAmount = groupOrder.currentAmount;
      const minThreshold = groupOrder.minThreshold;

      if (currentAmount >= minThreshold && groupOrder.status === 'COLLECTING') {
        // Threshold met - update status
        await this.updateGroupOrderStatus(groupOrderId, 'THRESHOLD_MET');
        
        // Send notifications to all participants
        await this.notifyGroupOrderThresholdMet(groupOrder);
        
        return { thresholdMet: true, groupOrder };
      }

      return { thresholdMet: false, groupOrder };
    } catch (error) {
      console.error('Error checking group order threshold:', error);
      throw error;
    }
  }

  // Update group order status
  async updateGroupOrderStatus(groupOrderId: string, status: GroupOrderStatus) {
    try {
      const groupOrder = await prisma.groupOrder.update({
        where: { id: groupOrderId },
        data: { status },
        include: {
          orders: {
            include: {
              user: true,
            },
          },
          product: true,
        },
      });

      // Create notification for status change
      await prisma.notification.createMany({
        data: groupOrder.orders.map(order => ({
          userId: order.userId,
          type: 'GROUP_ORDER_STATUS_UPDATE',
          title: `Group Order ${status.replace('_', ' ')}`,
          message: `Group order ${groupOrder.batchNumber} status updated to ${status}`,
          data: { groupOrderId, status },
        })),
      });

      return groupOrder;
    } catch (error) {
      console.error('Error updating group order status:', error);
      throw error;
    }
  }

  // Notify all participants when threshold is met
  async notifyGroupOrderThresholdMet(groupOrder: any) {
    try {
      const emailPromises = groupOrder.orders.map((order: any) =>
        emailService.sendGroupOrderThresholdMet({
          to: order.user.email,
          userName: order.user.name,
          productName: groupOrder.product.name,
          batchNumber: groupOrder.batchNumber,
          currentQuantity: groupOrder.currentQuantity,
          targetQuantity: groupOrder.targetQuantity,
          estimatedDelivery: groupOrder.estimatedDelivery?.toLocaleDateString() || 'TBD',
          groupOrderId: groupOrder.id,
        })
      );

      await Promise.all(emailPromises);
      console.log(`Threshold met notifications sent for group order: ${groupOrder.batchNumber}`);
    } catch (error) {
      console.error('Error sending threshold met notifications:', error);
    }
  }

  // Process group order when ready to ship
  async processGroupOrderForShipping(groupOrderId: string) {
    try {
      const groupOrder = await prisma.groupOrder.findUnique({
        where: { id: groupOrderId },
        include: {
          orders: {
            include: {
              user: true,
              address: true,
            },
          },
          product: true,
        },
      });

      if (!groupOrder) {
        throw new Error('Group order not found');
      }

      // Update group order status
      await this.updateGroupOrderStatus(groupOrderId, 'SHIPPED');

      // Update all individual orders
      await prisma.order.updateMany({
        where: { groupOrderId },
        data: {
          status: OrderStatus.SHIPPED,
        },
      });

      // Send shipping notifications
      await this.notifyOrdersShipped(groupOrder);

      return groupOrder;
    } catch (error) {
      console.error('Error processing group order for shipping:', error);
      throw error;
    }
  }

  // Notify orders shipped
  async notifyOrdersShipped(groupOrder: any) {
    try {
      const emailPromises = groupOrder.orders.map((order: any) =>
        emailService.sendOrderShipped({
          to: order.user.email,
          userName: order.user.name,
          orderNumber: order.orderNumber,
          productName: groupOrder.product.name,
          estimatedDelivery: groupOrder.estimatedDelivery?.toLocaleDateString() || 'TBD',
          orderId: order.id,
        })
      );

      await Promise.all(emailPromises);
      console.log(`Shipping notifications sent for group order: ${groupOrder.batchNumber}`);
    } catch (error) {
      console.error('Error sending shipping notifications:', error);
    }
  }

  // Mark group order as delivered
  async markGroupOrderDelivered(groupOrderId: string) {
    try {
      const groupOrder = await prisma.groupOrder.findUnique({
        where: { id: groupOrderId },
        include: {
          orders: {
            include: {
              user: true,
            },
          },
          product: true,
        },
      });

      if (!groupOrder) {
        throw new Error('Group order not found');
      }

      // Update group order status
      await this.updateGroupOrderStatus(groupOrderId, 'DELIVERED');

      // Update all individual orders
      await prisma.order.updateMany({
        where: { groupOrderId },
        data: {
          status: OrderStatus.DELIVERED,
          deliveredAt: new Date(),
        },
      });

      // Send delivery notifications
      await this.notifyOrdersDelivered(groupOrder);

      return groupOrder;
    } catch (error) {
      console.error('Error marking group order as delivered:', error);
      throw error;
    }
  }

  // Notify orders delivered
  async notifyOrdersDelivered(groupOrder: any) {
    try {
      const emailPromises = groupOrder.orders.map((order: any) =>
        emailService.sendOrderDelivered({
          to: order.user.email,
          userName: order.user.name,
          orderNumber: order.orderNumber,
          productName: groupOrder.product.name,
          orderId: order.id,
        })
      );

      await Promise.all(emailPromises);
      console.log(`Delivery notifications sent for group order: ${groupOrder.batchNumber}`);
    } catch (error) {
      console.error('Error sending delivery notifications:', error);
    }
  }

  // Cancel group order
  async cancelGroupOrder(groupOrderId: string, reason?: string) {
    try {
      const groupOrder = await prisma.groupOrder.findUnique({
        where: { id: groupOrderId },
        include: {
          orders: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!groupOrder) {
        throw new Error('Group order not found');
      }

      // Update group order status
      await this.updateGroupOrderStatus(groupOrderId, 'CANCELLED');

      // Cancel all individual orders
      await prisma.order.updateMany({
        where: { groupOrderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      // Create cancellation notifications
      await prisma.notification.createMany({
        data: groupOrder.orders.map((order: any) => ({
          userId: order.userId,
          type: 'ORDER_CANCELLED',
          title: 'Group Order Cancelled',
          message: `Group order ${groupOrder.batchNumber} has been cancelled${reason ? `: ${reason}` : ''}`,
          data: { groupOrderId, reason },
        })),
      });

      return groupOrder;
    } catch (error) {
      console.error('Error cancelling group order:', error);
      throw error;
    }
  }

  // Get order statistics
  async getOrderStats(userId?: string) {
    try {
      const where = userId ? { userId } : {};

      const [totalOrders, confirmedOrders, deliveredOrders, cancelledOrders] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.count({ where: { ...where, status: OrderStatus.CONFIRMED } }),
        prisma.order.count({ where: { ...where, status: OrderStatus.DELIVERED } }),
        prisma.order.count({ where: { ...where, status: OrderStatus.CANCELLED } }),
      ]);

      return {
        totalOrders,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders,
        successRate: totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting order stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const orderService = OrderService.getInstance(); 