"use client";

import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { WebSocketMessage } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Wifi,
  WifiOff,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface RealTimeNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
  isRead: boolean;
}

export function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { isConnected, lastMessage, connect, disconnect } = useWebSocket({
    onMessage: (message) => {
      handleWebSocketMessage(message);
    },
    onConnect: () => {
      toast.success("Real-time updates connected!");
    },
    onDisconnect: () => {
      toast.warning("Real-time updates disconnected");
    },
  });

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    const { type, data, timestamp } = message;
    
    let notification: RealTimeNotification;

    switch (type) {
      case 'order:updated':
        notification = {
          id: `order-${data.orderId}-${Date.now()}`,
          type: 'info',
          title: 'Order Updated',
          message: `Your order ${data.orderNumber || data.orderId} status has been updated to ${data.status}`,
          timestamp,
          data,
          isRead: false,
        };
        break;

      case 'payment:success':
        notification = {
          id: `payment-${data.orderId}-${Date.now()}`,
          type: 'success',
          title: 'Payment Successful',
          message: `Payment of ৳${data.amount} has been processed successfully`,
          timestamp,
          data,
          isRead: false,
        };
        break;

      case 'payment:failed':
        notification = {
          id: `payment-failed-${data.orderId}-${Date.now()}`,
          type: 'error',
          title: 'Payment Failed',
          message: `Payment failed: ${data.reason || 'Unknown error'}`,
          timestamp,
          data,
          isRead: false,
        };
        break;

      case 'groupOrder:thresholdMet':
        notification = {
          id: `group-${data.groupOrderId}-${Date.now()}`,
          type: 'success',
          title: 'Group Order Threshold Met!',
          message: `The group order for ${data.productName} has reached its minimum threshold`,
          timestamp,
          data,
          isRead: false,
        };
        break;

      case 'delivery:scheduled':
        notification = {
          id: `delivery-${data.deliveryId}-${Date.now()}`,
          type: 'info',
          title: 'Delivery Scheduled',
          message: `Your delivery has been scheduled for ${new Date(data.scheduledDate).toLocaleDateString()}`,
          timestamp,
          data,
          isRead: false,
        };
        break;

      case 'delivery:inTransit':
        notification = {
          id: `delivery-transit-${data.deliveryId}-${Date.now()}`,
          type: 'info',
          title: 'Delivery In Transit',
          message: `Your order is now on its way! ${data.trackingNumber ? `Tracking: ${data.trackingNumber}` : ''}`,
          timestamp,
          data,
          isRead: false,
        };
        break;

      case 'delivery:completed':
        notification = {
          id: `delivery-completed-${data.deliveryId}-${Date.now()}`,
          type: 'success',
          title: 'Delivery Completed!',
          message: `Your order has been delivered successfully`,
          timestamp,
          data,
          isRead: false,
        };
        break;

      case 'delivery:failed':
        notification = {
          id: `delivery-failed-${data.deliveryId}-${Date.now()}`,
          type: 'error',
          title: 'Delivery Failed',
          message: `Delivery could not be completed: ${data.reason || 'Unknown error'}`,
          timestamp,
          data,
          isRead: false,
        };
        break;

      case 'notification:new':
        notification = {
          id: data.notificationId || `notif-${Date.now()}`,
          type: 'info',
          title: data.title || 'New Notification',
          message: data.message || 'You have a new notification',
          timestamp,
          data,
          isRead: false,
        };
        break;

      default:
        return; // Ignore unknown message types
    }

    // Add notification to list
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10 notifications
    
    // Update unread count
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    showToastNotification(notification);
  };

  const showToastNotification = (notification: RealTimeNotification) => {
    const toastOptions = {
      duration: 5000,
      action: {
        label: 'View',
        onClick: () => setShowNotifications(true),
      },
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.message, toastOptions);
        break;
      case 'error':
        toast.error(notification.message, toastOptions);
        break;
      case 'warning':
        toast.warning(notification.message, toastOptions);
        break;
      default:
        toast.info(notification.message, toastOptions);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    const badgeConfig = {
      success: { variant: "default", text: "Success" },
      error: { variant: "destructive", text: "Error" },
      warning: { variant: "default", text: "Warning" },
      info: { variant: "secondary", text: "Info" },
    };

    const config = badgeConfig[type as keyof typeof badgeConfig] || { variant: "outline", text: type };
    
    return (
      <Badge variant={config.variant as "default" | "secondary" | "destructive" | "outline"}>
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="relative">
      {/* Connection Status */}
      <div className="mb-4">
        <Alert variant={isConnected ? "default" : "destructive"}>
          {isConnected ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <AlertDescription>
            {isConnected ? "Real-time updates connected" : "Real-time updates disconnected"}
            {!isConnected && (
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={connect}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconnect
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>

      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notifications Panel */}
        {showNotifications && (
          <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Real-time Notifications</span>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllAsRead}
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2" />
                  <p>No notifications yet</p>
                  <p className="text-sm">Real-time updates will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border rounded-lg transition-colors ${
                        notification.isRead ? 'bg-muted/50' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              {getNotificationBadge(notification.type)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>


    </div>
  );
} 