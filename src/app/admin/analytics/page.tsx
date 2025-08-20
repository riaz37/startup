"use client";

import { useState, useEffect, useCallback } from "react";
import { ClientPageLayout, MainContainer } from "@/components/layout";
import { AnalyticsDashboard } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3,
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useAdminAnalytics } from "@/hooks/api/use-admin-analytics";
import { 
  getSocket, 
  connectSocket, 
  disconnectSocket, 
  authenticateSocket, 
  joinRoom, 
  leaveRoom,
  onEvent,
  offEvent,
  emitEvent,
  isSocketConnected
} from "@/lib/socket";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [isRealTime, setIsRealTime] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  
  const { data, loading, error, fetchAnalytics, exportData } = useAdminAnalytics();
  
  // Socket instance
  const socket = getSocket();

  // Handle real-time data updates
  useEffect(() => {
    if (!socket) return;

    const handleAnalyticsUpdate = (data: Record<string, unknown>) => {
      console.log('Real-time analytics update received:', data);
      setLastUpdate(new Date());
      
      // Refresh analytics data when real-time update is received
      if (isRealTime) {
        fetchAnalytics();
      }
    };

    const handleOrderUpdate = (data: Record<string, unknown>) => {
      console.log('Real-time order update received:', data);
      setLastUpdate(new Date());
      
      // Refresh analytics data when order updates occur
      if (isRealTime) {
        fetchAnalytics();
      }
    };

    const handlePaymentUpdate = (data: Record<string, unknown>) => {
      console.log('Real-time payment update received:', data);
      setLastUpdate(new Date());
      
      // Refresh analytics data when payment updates occur
      if (isRealTime) {
        fetchAnalytics();
      }
    };

    // Listen for real-time events
    onEvent('analytics_update', handleAnalyticsUpdate);
    onEvent('admin:orderUpdate', handleOrderUpdate);
    onEvent('payment:success', handlePaymentUpdate);
    onEvent('payment:failed', handlePaymentUpdate);

    return () => {
      // Clean up event listeners
      offEvent('analytics_update', handleAnalyticsUpdate);
      offEvent('admin:orderUpdate', handleOrderUpdate);
      offEvent('payment:success', handlePaymentUpdate);
      offEvent('payment:failed', handlePaymentUpdate);
    };
  }, [socket, isRealTime, fetchAnalytics]);

  // Handle socket connection status
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('WebSocket connected in analytics page');
      setSocketStatus('connected');
      
      // Authenticate with user data
      if (user?.id && user?.role) {
        authenticateSocket(user.id, user.role);
        
        // Join admin room for real-time updates
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          joinRoom('admin');
        }
      }
    };

    const handleDisconnect = () => {
      console.log('WebSocket disconnected in analytics page');
      setSocketStatus('disconnected');
    };

    const handleConnectError = (error: Error) => {
      console.error('WebSocket connection error in analytics page:', error);
      setSocketStatus('disconnected');
    };

    // Set up socket event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Check initial connection status
    if (socket.connected) {
      setSocketStatus('connected');
      if (user?.id && user?.role) {
        authenticateSocket(user.id, user.role);
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
          joinRoom('admin');
        }
      }
    } else {
      setSocketStatus('disconnected');
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket, user?.id, user?.role]);

  // Auto-refresh when real-time is enabled
  useEffect(() => {
    if (!isRealTime || socketStatus !== 'connected') return;

    const interval = setInterval(() => {
      fetchAnalytics();
      setLastUpdate(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isRealTime, socketStatus, fetchAnalytics]);

  // Debug WebSocket connection
  useEffect(() => {
    console.log('Analytics page - Socket status:', socketStatus);
  }, [socketStatus]);

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <ClientPageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Access denied. Admin privileges required.</p>
            </div>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  const handleExport = () => {
    exportData("csv");
  };

  const handleRefresh = () => {
    fetchAnalytics();
    setLastUpdate(new Date());
  };

  const toggleRealTime = () => {
    setIsRealTime(!isRealTime);
    if (!isRealTime) {
      setLastUpdate(new Date());
    }
  };

  const handleWebSocketReconnect = () => {
    console.log('Manual WebSocket reconnection attempt');
    disconnectSocket();
    setTimeout(() => {
      connectSocket();
    }, 1000);
  };

  const handleTestAnalyticsUpdate = () => {
    if (socketStatus === 'connected') {
      // Emit a test analytics update event
      emitEvent('analytics:update', {
        type: 'test',
        message: 'Test analytics update',
        timestamp: new Date().toISOString()
      });
      console.log('Test analytics update event emitted');
    }
  };

  return (
    <ClientPageLayout>
      <MainContainer>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center mr-4">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Comprehensive insights into platform performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant={isRealTime ? "default" : "outline"}
                size="sm"
                onClick={toggleRealTime}
                className={isRealTime ? "bg-green-600 hover:bg-green-700" : ""}
                disabled={socketStatus !== 'connected'}
              >
                {isRealTime ? (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Live
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 mr-2" />
                    Offline
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              {/* Test WebSocket button for development */}
              {process.env.NODE_ENV === 'development' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTestAnalyticsUpdate}
                  disabled={socketStatus !== 'connected'}
                >
                  Test WS
                </Button>
              )}
            </div>
          </div>
          
          {/* WebSocket Status and Error Display */}
          {socketStatus === 'disconnected' && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                WebSocket disconnected. Real-time updates are not available.
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleWebSocketReconnect}
                  className="ml-2"
                >
                  Reconnect
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Status Bar */}
          <div className="flex items-center justify-between mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  socketStatus === 'connected' ? 'bg-green-500' : 
                  socketStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-muted-foreground">
                  {socketStatus === 'connected' ? 'Connected' : 
                   socketStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </span>
                {socketStatus === 'disconnected' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleWebSocketReconnect}
                    className="h-6 px-2 text-xs"
                  >
                    Reconnect
                  </Button>
                )}
              </div>
              
              {isRealTime && socketStatus === 'connected' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Wifi className="h-3 w-3 mr-1" />
                  Real-time
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Analytics Dashboard Component */}
        <AnalyticsDashboard
          data={data}
          loading={loading}
          onExport={handleExport}
          onRefresh={handleRefresh}
        />
      </MainContainer>
    </ClientPageLayout>
  );
} 