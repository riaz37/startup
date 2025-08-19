import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, prisma } from "@/lib";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { action, reason } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    const { id } = await params;
    let result;

    switch (action) {
      case "check-threshold":
        // Check if group order has met threshold
        const groupOrder = await prisma.groupOrder.findUnique({
          where: { id },
          include: { orders: true }
        });

        if (!groupOrder) {
          return NextResponse.json(
            { error: "Group order not found" },
            { status: 404 }
          );
        }

        const hasMetThreshold = groupOrder.currentAmount >= groupOrder.minThreshold;
        result = {
          hasMetThreshold,
          currentAmount: groupOrder.currentAmount,
          minThreshold: groupOrder.minThreshold,
          participantCount: groupOrder.orders.length
        };
        break;
      
      case "ship":
        // Mark group order as shipped
        result = await prisma.groupOrder.update({
          where: { id },
          data: { status: "SHIPPED" }
        });
        break;
      
      case "deliver":
        // Mark group order as delivered
        result = await prisma.groupOrder.update({
          where: { id },
          data: { status: "DELIVERED" }
        });
        break;
      
      case "cancel":
        if (!reason) {
          return NextResponse.json(
            { error: "Reason is required for cancellation" },
            { status: 400 }
          );
        }
        // Cancel group order
        result = await prisma.groupOrder.update({
          where: { id },
          data: { 
            status: "CANCELLED",
            // You might want to add a cancellationReason field to your schema
          }
        });
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