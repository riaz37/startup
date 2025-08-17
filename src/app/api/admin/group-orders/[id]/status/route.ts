import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { status, actualDelivery } = await request.json();

    // Validate status transition
    const currentOrder = await prisma.groupOrder.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Group order not found" }, { status: 404 });
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      "COLLECTING": ["THRESHOLD_MET", "EXPIRED"],
      "THRESHOLD_MET": ["ORDERED", "EXPIRED"],
      "ORDERED": ["SHIPPED", "CANCELLED"],
      "SHIPPED": ["DELIVERED", "LOST"],
      "DELIVERED": [],
      "EXPIRED": ["REOPENED"],
      "CANCELLED": [],
      "LOST": ["FOUND", "REFUNDED"],
    };

    if (!validTransitions[currentOrder.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${currentOrder.status} to ${status}` },
        { status: 400 }
      );
    }

    // Update the group order
    const updateData: { status: string; actualDelivery?: string } = { status };
    
    if (status === "DELIVERED" && actualDelivery) {
      updateData.actualDelivery = actualDelivery;
    }

    // Cast status to the proper type for Prisma
    const prismaUpdateData = {
      status: status as "COLLECTING" | "THRESHOLD_MET" | "ORDERED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "EXPIRED",
      ...(actualDelivery && { actualDelivery: new Date(actualDelivery) })
    };

    // First update the group order
    await prisma.groupOrder.update({
      where: { id },
      data: prismaUpdateData,
    });

    // Then fetch the updated order with related data
    const updatedOrder = await prisma.groupOrder.findUnique({
      where: { id },
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
    });

    if (!updatedOrder) {
      throw new Error("Failed to fetch updated group order");
    }

    // Log the status change (we'll use console.log for now since groupOrderLog table doesn't exist)
    console.log(`Group order ${id} status changed from ${currentOrder.status} to ${status} by ${session.user.id}`, {
      previousStatus: currentOrder.status,
      newStatus: status,
      actualDelivery,
    });

    // Transform response data
    const participantCount = updatedOrder.orders.length;
    const currentQuantity = updatedOrder.orders.reduce((sum: number, o) => sum + o.items.reduce((itemSum: number, item) => itemSum + item.quantity, 0), 0);
    const currentAmount = updatedOrder.orders.reduce((sum: number, o) => sum + o.totalAmount, 0);
    
    const progressPercentage = updatedOrder.targetQuantity > 0 
      ? (currentQuantity / updatedOrder.targetQuantity) * 100 
      : 0;

    const now = new Date();
    const expiresAt = new Date(updatedOrder.expiresAt);
    const timeRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const transformedOrder = {
      id: updatedOrder.id,
      batchNumber: updatedOrder.batchNumber,
      minThreshold: updatedOrder.minThreshold,
      currentAmount,
      targetQuantity: updatedOrder.targetQuantity,
      currentQuantity,
      pricePerUnit: updatedOrder.pricePerUnit,
      status: updatedOrder.status,
      expiresAt: updatedOrder.expiresAt,
      estimatedDelivery: updatedOrder.estimatedDelivery,
      actualDelivery: updatedOrder.actualDelivery,
      progressPercentage,
      participantCount,
      timeRemaining: Math.max(0, timeRemaining),
      product: updatedOrder.product,
      createdAt: updatedOrder.createdAt,
    };

    return NextResponse.json({ 
      message: "Status updated successfully",
      groupOrder: transformedOrder 
    });
  } catch (error) {
    console.error("Error updating group order status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
} 