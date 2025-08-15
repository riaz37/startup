import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { orderService } from "@/lib/order-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin();
    const { action } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "check-threshold":
        result = await orderService.checkGroupOrderThreshold(params.id);
        break;
      
      case "ship":
        result = await orderService.processGroupOrderForShipping(params.id);
        break;
      
      case "deliver":
        result = await orderService.markGroupOrderDelivered(params.id);
        break;
      
      case "cancel":
        const { reason } = await request.json();
        result = await orderService.cancelGroupOrder(params.id, reason);
        break;
      
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Group order ${action} completed successfully`,
      result,
    });
  } catch (error) {
    console.error("Error processing group order:", error);
    return NextResponse.json(
      { error: "Failed to process group order" },
      { status: 500 }
    );
  }
} 