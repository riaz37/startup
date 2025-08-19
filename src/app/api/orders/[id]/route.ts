import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, prisma } from "@/lib";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Users can only see their own orders, admins can see all
    const where: { id: string; userId?: string } = { id };
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      where.userId = user.id;
    }

    const order = await prisma.order.findUnique({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        groupOrder: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
                unitSize: true,
                imageUrl: true,
              },
            },
          },
        },
        address: true,
        items: true,
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);

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
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can update orders
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;
    const updates = await request.json();

    // Validate updates
    const allowedFields = ['status', 'paymentStatus', 'notes', 'estimatedDelivery'] as const;
    const validUpdates: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        validUpdates[field] = updates[field];
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Add updatedAt timestamp
    validUpdates.updatedAt = new Date();

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: validUpdates,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        groupOrder: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
                unitSize: true,
                imageUrl: true,
              },
            },
          },
        },
        address: true,
        items: true,
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    // Note: Audit logging could be implemented here when OrderAuditLog model is added to schema

    return NextResponse.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });

  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}