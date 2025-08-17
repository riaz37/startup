"use client";

import { useState, useEffect } from "react";
import { useWebSocketContext } from "@/contexts/websocket-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Users,
  ShoppingCart,
  DollarSign,
  Package
} from "lucide-react";

interface LiveMetric {
  id: string;
  type: 'order' | 'payment' | 'user' | 'delivery';
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
}

interface LiveActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  orderId?: string;
}

export function RealTimeDashboard() {
  const { isConnected, lastMessage, error } = useWebSocketContext();
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([]);
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    const initialMetrics: LiveMetric[] = [
      {
        id: '1',
        type: 'order',
        value: 1247,
        change: 12,
        trend: 'up',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'payment',
        value: 2400000,
        change: 15,
        trend: 'up',
        timestamp: new Date().toISOString(),
      },
      {
        id: '3',
        type: 'user',
        value: 856,
        change: 8,
        trend: 'up',
        timestamp: new Date().toISOString(),
      },
      {
        id: '4',
        type: 'delivery',
        value: 89,
        change: -3,
        trend: 'down',
        timestamp: new Date().toISOString(),
      },
    ];

    setLiveMetrics(initialMetrics);
  }, []);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      handleWebSocketMessage(lastMessage);
    }
  }, [lastMessage]);

  const handleWebSocketMessage = (message: any) => {
    const { type, data, timestamp } = message;

    // Update live metrics based on message type
    switch (type) {
      case 'order:created':
        updateMetric('order', 1, 'up');
        addLiveActivity('order', 'New Order Created', `Order ${data.orderNumber} has been created`, data.userId, data.orderId);
        break;

      case 'payment:success':
        updateMetric('payment', data.amount, 'up');
        addLiveActivity('payment', 'Payment Successful', `Payment of ৳${data.amount} processed`, data.userId, data.orderId);
        break;

      case 'groupOrder:thresholdMet':
        updateMetric('order', 1, 'up');
        addLiveActivity('order', 'Group Order Threshold Met', `Group order for ${data.productName} reached threshold`, undefined, data.groupOrderId);
        break;

      case 'delivery:completed':
        updateMetric('delivery', 1, 'up');
        addLiveActivity('delivery', 'Delivery Completed', `Order ${data.orderId} delivered successfully`, data.userId, data.orderId);
        break;
    }
  };

  const updateMetric = (type: string, change: number, trend: 'up' | 'down' | 'stable') => {
    setLiveMetrics(prev => 
      prev.map(metric => 
        metric.type === type 
          ? {
              ...metric,
              value: metric.value + change,
              change: change,
              trend,
              timestamp: new Date().toISOString(),
            }
          : metric
      )
    );
  };

  const addLiveActivity = (type: string, title: string, description: string, userId?: string, orderId?: string) => {
    const newActivity: LiveActivity = {
      id: `${type}-${Date.now()}`,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      userId,
      orderId,
    };

    setLiveActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10 activities
  };

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    
    // Simulate API call to refresh metrics
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update metrics with slight variations
    setLiveMetrics(prev => 
      prev.map(metric => ({
        ...metric,
        value: metric.value + Math.floor(Math.random() * 10) - 5,
        change: Math.floor(Math.random() * 20) - 10,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        timestamp: new Date().toISOString(),
      }))
    );
    
    setIsRefreshing(false);
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-6 w-6" />;
      case 'payment':
        return <DollarSign className="h-6 w-6" />;
      case 'user':
        return <Users className="h-6 w-6" />;
      case 'delivery':
        return <Package className="h-6 w-6" />;
      default:
        return <Activity className="h-6 w-6" />;
    }
  };

  const getMetricColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'text-blue-600';
      case 'payment':
        return 'text-green-600';
      case 'user':
        return 'text-purple-600';
      case 'delivery':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatMetricValue = (type: string, value: number) => {
    switch (type) {
      case 'payment':
        return new Intl.NumberFormat("en-BD", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      default:
        return new Intl.NumberFormat("en-BD").format(value);
    }
  };

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
          {isConnected ? "Real-time updates active" : "Real-time updates disconnected"}
          {error && ` - Error: ${error.message}`}
        </AlertDescription>
      </Alert>

      {/* Live Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Live Metrics
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshMetrics}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {liveMetrics.map((metric) => (
              <div
                key={metric.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`${getMetricColor(metric.type)}`}>
                    {getMetricIcon(metric.type)}
                  </div>
                  {getTrendIcon(metric.trend)}
                </div>
                
                <div className="mb-2">
                  <p className="text-2xl font-bold">
                    {formatMetricValue(metric.type, metric.value)}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {metric.type}s
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <span className={`font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {metric.trend === 'up' ? '+' : ''}{metric.change}
                  </span>
                  <span className="text-muted-foreground">vs last update</span>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Updated: {new Date(metric.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Live Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {liveActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p>No live activities yet</p>
              <p className="text-sm">Real-time updates will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <Badge variant="outline" className="text-xs capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="font-medium text-sm">WebSocket Connection</p>
                <p className="text-xs text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-sm">API Server</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-sm">Database</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-sm">Email Service</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 