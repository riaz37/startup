import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, prisma } from "@/lib";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, any> = {};
    
    // Users can only see their own orders, admins can see all
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      if (userId) {
        where.userId = userId;
      }
    } else {
      where.userId = user.id;
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
        orderBy: {
          placedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { groupOrderId, addressId, quantity, notes } = body;

    // Validate required fields
    if (!groupOrderId || !addressId || !quantity) {
      return NextResponse.json(
        { error: "Group order ID, address ID, and quantity are required" },
        { status: 400 }
      );
    }

    // Validate group order exists and is active
    const groupOrder = await prisma.groupOrder.findUnique({
      where: { id: groupOrderId },
      include: { product: true },
    });

    if (!groupOrder) {
      return NextResponse.json(
        { error: "Group order not found" },
        { status: 400 }
      );
    }

    if (groupOrder.status !== "COLLECTING") {
      return NextResponse.json(
        { error: "Group order is no longer accepting orders" },
        { status: 400 }
      );
    }

    if (groupOrder.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Group order has expired" },
        { status: 400 }
      );
    }

    // Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: "Invalid address" },
        { status: 400 }
      );
    }

    // Check if user already has an order in this group
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        groupOrderId,
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        { error: "You have already joined this group order" },
        { status: 400 }
      );
    }

    // Validate quantity
    const requestedQuantity = parseInt(quantity);
    if (requestedQuantity < groupOrder.product.minOrderQty) {
      return NextResponse.json(
        { error: `Minimum order quantity is ${groupOrder.product.minOrderQty}` },
        { status: 400 }
      );
    }

    if (groupOrder.product.maxOrderQty && requestedQuantity > groupOrder.product.maxOrderQty) {
      return NextResponse.json(
        { error: `Maximum order quantity is ${groupOrder.product.maxOrderQty}` },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = requestedQuantity * groupOrder.pricePerUnit;

    // Generate order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          groupOrderId,
          addressId,
          orderNumber,
          totalAmount,
          notes,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
        include: {
          groupOrder: {
            include: {
              product: true,
            },
          },
          address: true,
          user: true,
        },
      });

      // Create order item
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: groupOrder.productId,
          quantity: requestedQuantity,
          unitPrice: groupOrder.pricePerUnit,
          totalPrice: totalAmount,
        },
      });

      // Update group order totals
      await tx.groupOrder.update({
        where: { id: groupOrderId },
        data: {
          currentAmount: {
            increment: totalAmount,
          },
          currentQuantity: {
            increment: requestedQuantity,
          },
        },
      });

      return newOrder;
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "ORDER_CONFIRMATION",
        title: "Order Placed Successfully",
        message: `Your order for ${groupOrder.product.name} has been placed successfully.`,
        data: { orderId: order.id, groupOrderId },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
} 