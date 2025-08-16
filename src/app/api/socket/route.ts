import { NextRequest, NextResponse } from "next/server";
import { websocketManager } from "@/lib/websocket/websocket";
import type { WebSocketEvents } from "@/lib/websocket/websocket";

export async function GET(request: NextRequest) {
  try {
    // This endpoint is used to check WebSocket server status
    return NextResponse.json({
      status: "WebSocket server is running",
      connectedUsers: websocketManager.getConnectedUsersCount(),
      connectedAdmins: websocketManager.getConnectedAdminsCount(),
    });
  } catch (error) {
    console.error("WebSocket status check error:", error);
    return NextResponse.json(
      { error: "Failed to check WebSocket status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case "broadcast":
        // Broadcast message to all connected users
        websocketManager.emitToAll(data.event as keyof WebSocketEvents, data.payload);
        return NextResponse.json({ success: true, message: "Message broadcasted" });

      case "notifyUser":
        // Send notification to specific user
        const { userId, event, payload } = data;
        websocketManager.emitToUser(userId, event as keyof WebSocketEvents, payload);
        return NextResponse.json({ success: true, message: "User notified" });

      case "notifyAdmins":
        // Send notification to admin users
        websocketManager.emitToAdmins(data.event as keyof WebSocketEvents, data.payload);
        return NextResponse.json({ success: true, message: "Admins notified" });

      case "getStats":
        // Get WebSocket server statistics
        return NextResponse.json({
          connectedUsers: websocketManager.getConnectedUsersCount(),
          connectedAdmins: websocketManager.getConnectedAdminsCount(),
          onlineUsers: websocketManager.getOnlineUsers(),
        });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("WebSocket action error:", error);
    return NextResponse.json(
      { error: "Failed to perform WebSocket action" },
      { status: 500 }
    );
  }
} 