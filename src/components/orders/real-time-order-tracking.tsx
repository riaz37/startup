"use client";

import { useState, useEffect } from "react";
import { useWebSocketContext } from "@/contexts/websocket-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MapPin,
  Calendar,
  Wifi,
  WifiOff
} from "lucide-react";

interface OrderStatus {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  deliveryStatus?: string;
  lastUpdated: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  deliveryAddress?: string;
  pickupLocation?: string;
}

interface RealTimeOrderTrackingProps {
  orderId: string;
  initialStatus: OrderStatus;
}

export function RealTimeOrderTracking({ orderId, initialStatus }: RealTimeOrderTrackingProps) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(initialStatus);
  const [statusHistory, setStatusHistory] = useState<Array<{ status: string; timestamp: string; message: string }>>([]);

  const { isConnected, lastMessage } = useWebSocketContext();

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.event && lastMessage.data) {
      const data = lastMessage.data as Record<string, unknown>;
      if (lastMessage.event === 'order:updated' && data.orderId === orderId) {
        handleOrderUpdate(data);
      } else if (lastMessage.event === 'delivery:inTransit' && data.orderId === orderId) {
        handleDeliveryUpdate(data);
      } else if (lastMessage.event === 'delivery:completed' && data.orderId === orderId) {
        handleDeliveryComplete(data);
      }
    }
  }, [lastMessage, orderId]);

  useEffect(() => {
    // Initialize status history
    setStatusHistory([
      {
        status: initialStatus.status,
        timestamp: initialStatus.lastUpdated,
        message: `Order ${initialStatus.orderNumber} created`,
      },
    ]);
  }, [initialStatus]);

  const handleOrderUpdate = (data: Record<string, unknown>) => {
    const newStatus = {
      ...orderStatus,
      status: String(data.status),
      lastUpdated: new Date().toISOString(),
    };

    setOrderStatus(newStatus);
    
    // Add to status history
    const statusMessage = getStatusMessage(String(data.status), data);
    setStatusHistory(prev => [
      {
        status: String(data.status),
        timestamp: new Date().toISOString(),
        message: statusMessage,
      },
      ...prev,
    ]);
  };

  const handleDeliveryUpdate = (data: Record<string, unknown>) => {
    const newStatus = {
      ...orderStatus,
      deliveryStatus: 'IN_TRANSIT',
      trackingNumber: data.trackingNumber ? String(data.trackingNumber) : undefined,
      lastUpdated: new Date().toISOString(),
    };

    setOrderStatus(newStatus);
    
    setStatusHistory(prev => [
      {
        status: 'IN_TRANSIT',
        timestamp: new Date().toISOString(),
        message: `Order is now in transit${data.trackingNumber ? ` (Tracking: ${String(data.trackingNumber)})` : ''}`,
      },
      ...prev,
    ]);
  };

  const handleDeliveryComplete = (data: Record<string, unknown>) => {
    const newStatus = {
      ...orderStatus,
      deliveryStatus: 'DELIVERED',
      lastUpdated: new Date().toISOString(),
    };

    setOrderStatus(newStatus);
    
    setStatusHistory(prev => [
      {
        status: 'DELIVERED',
        timestamp: new Date().toISOString(),
        message: 'Order has been delivered successfully!',
      },
      ...prev,
    ]);
  };

  const getStatusMessage = (status: string, data?: Record<string, unknown>): string => {
    switch (status) {
      case 'PENDING':
        return 'Order is pending confirmation';
      case 'CONFIRMED':
        return 'Order has been confirmed and is being processed';
      case 'PROCESSING':
        return 'Order is being prepared for shipping';
      case 'SHIPPED':
        return 'Order has been shipped';
      case 'DELIVERED':
        return 'Order has been delivered successfully';
      case 'CANCELLED':
        return `Order has been cancelled${data?.reason ? `: ${String(data.reason)}` : ''}`;
      case 'REFUNDED':
        return 'Order has been refunded';
      default:
        return `Order status updated to ${status}`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'PROCESSING':
        return <Package className="h-4 w-4 text-purple-600" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4 text-indigo-600" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'REFUNDED':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary", text: "Pending" },
      CONFIRMED: { variant: "default", text: "Confirmed" },
      PROCESSING: { variant: "default", text: "Processing" },
      SHIPPED: { variant: "default", text: "Shipped" },
      DELIVERED: { variant: "default", text: "Delivered" },
      CANCELLED: { variant: "destructive", text: "Cancelled" },
      REFUNDED: { variant: "outline", text: "Refunded" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline", text: status };
    
    return (
      <Badge variant={config.variant as "default" | "secondary" | "destructive" | "outline"}>
        {config.text}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary", text: "Pending" },
      PROCESSING: { variant: "default", text: "Processing" },
      COMPLETED: { variant: "default", text: "Completed" },
      FAILED: { variant: "destructive", text: "Failed" },
      REFUNDED: { variant: "outline", text: "Refunded" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline", text: status };
    
    return (
      <Badge variant={config.variant as "default" | "secondary" | "destructive" | "outline"}>
        {config.text}
      </Badge>
    );
  };

  const getProgressValue = (status: string): number => {
    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  };

  const getStatusSteps = () => {
    return [
      { key: 'PENDING', label: 'Order Placed', description: 'Order has been placed and is pending confirmation' },
      { key: 'CONFIRMED', label: 'Order Confirmed', description: 'Order has been confirmed and payment processed' },
      { key: 'PROCESSING', label: 'Processing', description: 'Order is being prepared for shipping' },
      { key: 'SHIPPED', label: 'Shipped', description: 'Order has been shipped and is on its way' },
      { key: 'DELIVERED', label: 'Delivered', description: 'Order has been delivered successfully' },
    ];
  };

  const statusSteps = getStatusSteps();
  const currentStepIndex = statusSteps.findIndex(step => step.key === orderStatus.status);
  const progress = getProgressValue(orderStatus.status);

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Alert variant={isConnected ? "default" : "destructive"}>
        {isConnected ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertDescription>
          {isConnected ? "Real-time tracking active" : "Real-time tracking disconnected"}
        </AlertDescription>
      </Alert>

      {/* Order Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Status</span>
            <div className="flex items-center space-x-2">
              {getStatusBadge(orderStatus.status)}
              {getPaymentStatusBadge(orderStatus.paymentStatus)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Order Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Current Status */}
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              {getStatusIcon(orderStatus.status)}
              <div>
                <p className="font-medium">Current Status: {statusSteps[currentStepIndex]?.label || orderStatus.status}</p>
                <p className="text-sm text-muted-foreground">
                  {statusSteps[currentStepIndex]?.description || 'Status updated'}
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order Number</p>
                <p className="font-medium">{orderStatus.orderNumber}</p>
              </div>
              
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(orderStatus.lastUpdated).toLocaleString()}
                </p>
              </div>
              
              {orderStatus.estimatedDelivery && (
                <div>
                  <p className="text-muted-foreground">Estimated Delivery</p>
                  <p className="font-medium">
                    {new Date(orderStatus.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {orderStatus.trackingNumber && (
                <div>
                  <p className="text-muted-foreground">Tracking Number</p>
                  <p className="font-medium">{orderStatus.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Delivery Information */}
            {(orderStatus.deliveryAddress || orderStatus.pickupLocation) && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {orderStatus.deliveryAddress ? 'Delivery Address' : 'Pickup Location'}
                </h4>
                <p className="text-sm">
                  {orderStatus.deliveryAddress || orderStatus.pickupLocation}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusHistory.map((status, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                  {index < statusHistory.length - 1 && (
                    <div className="w-0.5 h-8 bg-muted mx-auto"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-sm">{status.status}</h4>
                    <Badge variant="outline" className="text-xs">
                      {new Date(status.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {status.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(status.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Order Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div
                  key={step.key}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isCurrent ? 'bg-primary/10 border border-primary/20' : 
                    isCompleted ? 'bg-green-50 border border-green-200' : 
                    'bg-muted/50'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-600 text-white' : 
                    isCurrent ? 'bg-primary text-white' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                      {step.label}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  
                  {isCurrent && (
                    <Badge variant="default" className="animate-pulse">
                      Current
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 