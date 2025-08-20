"use client";

import { useWebSocketContext } from "@/contexts/websocket-context";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export function WebSocketStatus() {
  const { isConnected, error, connect, disconnect } = useWebSocketContext();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          WebSocket Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Connection Status:</span>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            Error: {error.message}
          </div>
        )}
        
        <div className="flex gap-2">
          {!isConnected ? (
            <Button onClick={connect} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Connect
            </Button>
          ) : (
            <Button onClick={disconnect} variant="outline" className="flex-1">
              Disconnect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 