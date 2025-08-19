import { NextRequest, NextResponse } from "next/server";
import { socketServer } from "@/lib/websocket/socket-server";

// This route handles Socket.IO connections and actions
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: "Socket.IO server ready",
      message: "Use Socket.IO client to connect to this endpoint",
      path: "/api/socket",
      transports: ["websocket", "polling"],
      deployment: "universal",
      connectedUsers: socketServer.getConnectedUsersCount(),
      connectedAdmins: socketServer.getConnectedAdminsCount(),
    });
  } catch (error) {
    console.error("Socket.IO handler error:", error);
    return NextResponse.json(
      { error: "Failed to initialize Socket.IO handler" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case "broadcast":
        socketServer.emitToAll(data.event, data.payload);
        return NextResponse.json({ success: true, message: "Message broadcasted" });

      case "notifyUser":
        const { userId, event, payload } = data;
        socketServer.emitToUser(userId, event, payload);
        return NextResponse.json({ success: true, message: "User notified" });

      case "notifyAdmins":
        socketServer.emitToAdmins(data.event, data.payload);
        return NextResponse.json({ success: true, message: "Admins notified" });

      case "getStats":
        return NextResponse.json({
          connectedUsers: socketServer.getConnectedUsersCount(),
          connectedAdmins: socketServer.getConnectedAdminsCount(),
          onlineUsers: socketServer.getOnlineUsers(),
        });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Socket.IO action error:", error);
    return NextResponse.json(
      { error: "Failed to perform Socket.IO action" },
      { status: 500 }
    );
  }
} 