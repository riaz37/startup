import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groupOrders = await prisma.groupOrder.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
            unitSize: true,
          },
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            items: {
              select: {
                quantity: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data for admin view
    const transformedOrders = groupOrders.map((order) => {
      const participantCount = order.orders.length;
      const currentQuantity = order.orders.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
      const currentAmount = order.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      
      // Calculate progress percentage with safety checks
      let progressPercentage = 0;
      if (order.targetQuantity > 0 && currentQuantity >= 0) {
        progressPercentage = Math.min((currentQuantity / order.targetQuantity) * 100, 100);
      }
      
      // Ensure progressPercentage is a valid number
      if (isNaN(progressPercentage) || !isFinite(progressPercentage)) {
        progressPercentage = 0;
      }

      // Calculate time remaining
      const now = new Date();
      const expiresAt = new Date(order.expiresAt);
      const timeRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Determine status
      let status = order.status;
      if (status === "COLLECTING" && timeRemaining <= 0) {
        status = "EXPIRED";
      } else if (status === "COLLECTING" && currentAmount >= order.minThreshold) {
        status = "THRESHOLD_MET";
      }

      return {
        id: order.id,
        batchNumber: order.batchNumber,
        minThreshold: order.minThreshold,
        currentAmount: Math.max(0, currentAmount),
        targetQuantity: order.targetQuantity,
        currentQuantity: Math.max(0, currentQuantity),
        pricePerUnit: order.pricePerUnit,
        status,
        expiresAt: order.expiresAt,
        estimatedDelivery: order.estimatedDelivery,
        progressPercentage: Math.round(progressPercentage * 100) / 100, // Round to 2 decimal places
        participantCount: Math.max(0, participantCount),
        timeRemaining: Math.max(0, timeRemaining),
        product: order.product,
        createdAt: order.createdAt,
      };
    });

    return NextResponse.json({ groupOrders: transformedOrders });
  } catch (error) {
    console.error("Error fetching admin group orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch group orders" },
      { status: 500 }
    );
  }
} 