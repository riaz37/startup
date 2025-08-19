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
  RefreshCw
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useAdminAnalytics } from "@/hooks/api/use-admin-analytics";
import { useWebSocketContext } from "@/contexts/websocket-context";

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [isRealTime, setIsRealTime] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const { data, loading, error, fetchAnalytics, exportData } = useAdminAnalytics();
  
  // WebSocket connection for real-time updates
  const { isConnected, lastMessage } = useWebSocketContext();

  // Handle real-time data updates
  useEffect(() => {
    if (isRealTime && isConnected && lastMessage) {
      try {
        if (lastMessage.event === "analytics_update") {
          // Update analytics data in real-time
          setLastUpdate(new Date());
          // You can implement more sophisticated real-time updates here
        }
      } catch (error) {
        console.error("Error parsing real-time message:", error);
      }
    }
  }, [isRealTime, isConnected, lastMessage]);

  // Auto-refresh when real-time is enabled
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      fetchAnalytics();
      setLastUpdate(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isRealTime, fetchAnalytics]);

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
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="flex items-center justify-between mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {isRealTime && (
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