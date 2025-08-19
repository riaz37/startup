import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database";

// GET /api/admin/group-orders/[id] - Get group order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const groupOrder = await prisma.groupOrder.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
        orders: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: true,
          },
        },
      },
    });

    if (!groupOrder) {
      return NextResponse.json({ error: "Group order not found" }, { status: 404 });
    }

    // Calculate derived fields
    const participantCount = groupOrder.orders.length;
    const currentQuantity = groupOrder.orders.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const currentAmount = groupOrder.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    // Calculate progress percentage with safety checks
    let progressPercentage = 0;
    if (groupOrder.targetQuantity > 0 && currentQuantity >= 0) {
      progressPercentage = Math.min((currentQuantity / groupOrder.targetQuantity) * 100, 100);
    }
    
    // Ensure progressPercentage is a valid number
    if (isNaN(progressPercentage) || !isFinite(progressPercentage)) {
      progressPercentage = 0;
    }

    // Calculate time remaining
    const now = new Date();
    const expiresAt = new Date(groupOrder.expiresAt);
    const timeRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Transform the response to include calculated fields
    const transformedGroupOrder = {
      ...groupOrder,
      currentQuantity: Math.max(0, currentQuantity),
      currentAmount: Math.max(0, currentAmount),
      progressPercentage: Math.round(progressPercentage * 100) / 100, // Round to 2 decimal places
      participantCount: Math.max(0, participantCount),
      timeRemaining: Math.max(0, timeRemaining),
    };

    return NextResponse.json({ groupOrder: transformedGroupOrder });
  } catch (error) {
    console.error("Error fetching group order:", error);
    return NextResponse.json(
      { error: "Failed to fetch group order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      productId,
      minThreshold,
      targetQuantity,
      pricePerUnit,
      expiresAt,
      estimatedDelivery,
      groupOrderImageUrl,
      groupOrderImagePublicId
    } = body;

    // Validate required fields
    if (!productId || !minThreshold || !targetQuantity || !pricePerUnit || !expiresAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if group order exists
    const existingOrder = await prisma.groupOrder.findUnique({
      where: { id },
      include: { product: true }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Group order not found" },
        { status: 404 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Validate dates
    const expiresDate = new Date(expiresAt);
    const now = new Date();
    
    if (expiresDate <= now) {
      return NextResponse.json(
        { error: "Expiry date must be in the future" },
        { status: 400 }
      );
    }

    // Update the group order
    const updatedOrder = await prisma.groupOrder.update({
      where: { id },
      data: {
        productId,
        minThreshold: parseFloat(minThreshold),
        targetQuantity: parseInt(targetQuantity),
        pricePerUnit: parseFloat(pricePerUnit),
        expiresAt: expiresDate,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        groupOrderImageUrl: groupOrderImageUrl || null,
        groupOrderImagePublicId: groupOrderImagePublicId || null,
        updatedAt: new Date()
      },
      include: {
        product: true,
        orders: {
          include: {
            items: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Group order updated successfully",
      groupOrder: updatedOrder
    });

  } catch (error) {
    console.error("Error updating group order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if group order exists
    const existingOrder = await prisma.groupOrder.findUnique({
      where: { id },
      include: { orders: true }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Group order not found" },
        { status: 404 }
      );
    }

    // Check if there are any orders associated with this group order
    if (existingOrder.orders.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete group order with existing orders" },
        { status: 400 }
      );
    }

    // Delete the group order
    await prisma.groupOrder.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Group order deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting group order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 