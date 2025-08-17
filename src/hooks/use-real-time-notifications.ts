"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWebSocketContext } from '@/contexts/websocket-context';
import { toast } from 'sonner';

interface NotificationSettings {
  orders: boolean;
  payments: boolean;
  deliveries: boolean;
  groupOrders: boolean;
  system: boolean;
}

interface UseRealTimeNotificationsOptions {
  settings?: Partial<NotificationSettings>;
  showToasts?: boolean;
  autoMarkRead?: boolean;
}

export function useRealTimeNotifications(options: UseRealTimeNotificationsOptions = {}) {
  const {
    settings = {
      orders: true,
      payments: true,
      deliveries: true,
      groupOrders: true,
      system: true,
    },
    showToasts = true,
    autoMarkRead = false,
  } = options;

  const { isConnected, lastMessage } = useWebSocketContext();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && isConnected) {
      handleNotificationMessage(lastMessage);
    }
  }, [lastMessage, isConnected]);

  const handleNotificationMessage = useCallback((message: any) => {
    const { type, data } = message;

    // Check if this notification type is enabled
    if (!isNotificationTypeEnabled(type)) {
      return;
    }

    // Create notification object
    const notification = createNotificationFromMessage(type, data);
    
    if (notification) {
      // Add to notifications list
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Show toast if enabled
      if (showToasts) {
        showNotificationToast(notification);
      }
      
      // Auto mark as read if enabled
      if (autoMarkRead) {
        setTimeout(() => {
          markAsRead(notification.id);
        }, 5000); // Mark as read after 5 seconds
      }
    }
  }, [settings, showToasts, autoMarkRead]);

  const isNotificationTypeEnabled = (type: string): boolean => {
    switch (type) {
      case 'order:created':
      case 'order:updated':
      case 'order:cancelled':
        return settings.orders;
      
      case 'payment:success':
      case 'payment:failed':
      case 'payment:refunded':
        return settings.payments;
      
      case 'delivery:scheduled':
      case 'delivery:inTransit':
      case 'delivery:completed':
      case 'delivery:failed':
        return settings.deliveries;
      
      case 'groupOrder:created':
      case 'groupOrder:thresholdMet':
      case 'groupOrder:statusChanged':
        return settings.groupOrders;
      
      case 'admin:systemAlert':
        return settings.system;
      
      default:
        return false;
    }
  };

  const createNotificationFromMessage = (type: string, data: any) => {
    const baseNotification = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    switch (type) {
      case 'order:created':
        return {
          ...baseNotification,
          title: 'New Order Created',
          message: `Order ${data.orderNumber || data.orderId} has been created successfully`,
          priority: 'medium',
          category: 'order',
        };

      case 'order:updated':
        return {
          ...baseNotification,
          title: 'Order Updated',
          message: `Order ${data.orderNumber || data.orderId} status changed to ${data.status}`,
          priority: 'medium',
          category: 'order',
        };

      case 'order:cancelled':
        return {
          ...baseNotification,
          title: 'Order Cancelled',
          message: `Order ${data.orderNumber || data.orderId} has been cancelled${data.reason ? `: ${data.reason}` : ''}`,
          priority: 'high',
          category: 'order',
        };

      case 'payment:success':
        return {
          ...baseNotification,
          title: 'Payment Successful',
          message: `Payment of ৳${data.amount} has been processed successfully`,
          priority: 'high',
          category: 'payment',
        };

      case 'payment:failed':
        return {
          ...baseNotification,
          title: 'Payment Failed',
          message: `Payment failed: ${data.reason || 'Unknown error'}`,
          priority: 'high',
          category: 'payment',
        };

      case 'payment:refunded':
        return {
          ...baseNotification,
          title: 'Payment Refunded',
          message: `Payment of ৳${data.amount} has been refunded`,
          priority: 'medium',
          category: 'payment',
        };

      case 'delivery:scheduled':
        return {
          ...baseNotification,
          title: 'Delivery Scheduled',
          message: `Your delivery has been scheduled for ${new Date(data.scheduledDate).toLocaleDateString()}`,
          priority: 'medium',
          category: 'delivery',
        };

      case 'delivery:inTransit':
        return {
          ...baseNotification,
          title: 'Delivery In Transit',
          message: `Your order is now on its way!${data.trackingNumber ? ` Tracking: ${data.trackingNumber}` : ''}`,
          priority: 'medium',
          category: 'delivery',
        };

      case 'delivery:completed':
        return {
          ...baseNotification,
          title: 'Delivery Completed!',
          message: 'Your order has been delivered successfully',
          priority: 'high',
          category: 'delivery',
        };

      case 'delivery:failed':
        return {
          ...baseNotification,
          title: 'Delivery Failed',
          message: `Delivery could not be completed: ${data.reason || 'Unknown error'}`,
          priority: 'high',
          category: 'delivery',
        };

      case 'groupOrder:created':
        return {
          ...baseNotification,
          title: 'New Group Order',
          message: `New group order available for ${data.productName}`,
          priority: 'medium',
          category: 'groupOrder',
        };

      case 'groupOrder:thresholdMet':
        return {
          ...baseNotification,
          title: 'Group Order Threshold Met!',
          message: `The group order for ${data.productName} has reached its minimum threshold`,
          priority: 'high',
          category: 'groupOrder',
        };

      case 'groupOrder:statusChanged':
        return {
          ...baseNotification,
          title: 'Group Order Status Changed',
          message: `Group order for ${data.productName} status changed to ${data.status}`,
          priority: 'medium',
          category: 'groupOrder',
        };

      case 'admin:systemAlert':
        return {
          ...baseNotification,
          title: 'System Alert',
          message: data.message,
          priority: data.level === 'error' ? 'high' : 'medium',
          category: 'system',
        };

      default:
        return null;
    }
  };

  const showNotificationToast = (notification: any) => {
    const toastOptions = {
      duration: notification.priority === 'high' ? 8000 : 5000,
      action: {
        label: 'View',
        onClick: () => {
          // Handle view action
          console.log('View notification:', notification);
        },
      },
    };

    switch (notification.priority) {
      case 'high':
        toast.error(notification.message, toastOptions);
        break;
      case 'medium':
        toast.info(notification.message, toastOptions);
        break;
      default:
        toast(notification.message, toastOptions);
    }
  };

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const getNotificationsByCategory = useCallback((category: string) => {
    return notifications.filter(notif => notif.category === category);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notif => !notif.isRead);
  }, [notifications]);

  return {
    // State
    notifications,
    unreadCount,
    isConnected,
    
    // Actions
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    
    // Utilities
    getNotificationsByCategory,
    getUnreadNotifications,
    
    // Settings
    updateSettings: (newSettings: Partial<NotificationSettings>) => {
      Object.assign(settings, newSettings);
    },
  };
} 