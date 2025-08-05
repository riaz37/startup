import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: user.id
      },
      include: {
        groupOrder: {
          include: {
            product: {
              select: {
                name: true,
                unit: true,
                unitSize: true,
                imageUrl: true
              }
            }
          }
        },
        address: true,
        items: true,
        delivery: {
          include: {
            pickupLocation: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Calculate order progress based on group order status
    const statusSteps = [
      { key: "COLLECTING", label: "Collecting Orders", description: "Waiting for more participants" },
      { key: "THRESHOLD_MET", label: "Threshold Met", description: "Minimum orders reached" },
      { key: "ORDERED", label: "Order Placed", description: "Order placed with supplier" },
      { key: "SHIPPED", label: "Shipped", description: "Order is on the way" },
      { key: "DELIVERED", label: "Ready for Pickup", description: "Ready for collection" }
    ];

    const currentStepIndex = statusSteps.findIndex(step => step.key === order.groupOrder.status);
    const progress = currentStepIndex >= 0 ? ((currentStepIndex + 1) / statusSteps.length) * 100 : 0;

    return NextResponse.json({
      ...order,
      statusSteps,
      currentStepIndex,
      progress
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can update orders." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, deliveredAt } = body;

    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (deliveredAt) {
      updateData.deliveredAt = new Date(deliveredAt);
    }

    const order = await prisma.order.update({
      where: { id: id },
      data: updateData,
      include: {
        groupOrder: {
          include: {
            product: {
              select: {
                name: true,
                unit: true,
                unitSize: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}