import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib";
import { prisma } from "@/lib";

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
    const where: Record<string, string | undefined> = {};
    
    // Users can only see their own priority orders, admins can see all
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

    const [priorityOrders, total] = await Promise.all([
      prisma.priorityOrder.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              unit: true,
              unitSize: true,
              imageUrl: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          address: true,
          delivery: {
            include: {
              pickupLocation: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.priorityOrder.count({ where }),
    ]);

    return NextResponse.json({
      priorityOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching priority orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch priority orders" },
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
    const { 
      productId, 
      quantity, 
      addressId, 
      deliveryType, 
      notes 
    } = body;

    // Validate required fields
    if (!productId || !quantity || !addressId || !deliveryType) {
      return NextResponse.json(
        { error: "Product ID, quantity, address ID, and delivery type are required" },
        { status: 400 }
      );
    }

    // Validate product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: "Product is not available" },
        { status: 400 }
      );
    }

    // Validate quantity
    if (quantity < product.minOrderQty) {
      return NextResponse.json(
        { error: `Minimum order quantity is ${product.minOrderQty}` },
        { status: 400 }
      );
    }

    if (product.maxOrderQty && quantity > product.maxOrderQty) {
      return NextResponse.json(
        { error: `Maximum order quantity is ${product.maxOrderQty}` },
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
        { error: "Address not found or unauthorized" },
        { status: 404 }
      );
    }

    // Calculate total amount (MRP price)
    const totalAmount = quantity * product.mrp;

    // Generate order number
    const orderNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create priority order with transaction
    const priorityOrder = await prisma.$transaction(async (tx) => {
      // Create priority order
      const newPriorityOrder = await tx.priorityOrder.create({
        data: {
          productId,
          userId: user.id,
          addressId,
          orderNumber,
          quantity,
          unitPrice: product.mrp,
          totalAmount,
          deliveryType,
          notes,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
          address: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create priority order item
      await tx.priorityOrderItem.create({
        data: {
          priorityOrderId: newPriorityOrder.id,
          productId,
          quantity,
          unitPrice: product.mrp,
          totalPrice: totalAmount,
        },
      });

      return newPriorityOrder;
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "PRIORITY_ORDER_CONFIRMED",
        title: "Priority Order Placed",
        message: `Your priority order for ${product.name} has been placed successfully. Order number: ${orderNumber}`,
        data: { priorityOrderId: priorityOrder.id, productName: product.name },
      },
    });

    return NextResponse.json(priorityOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating priority order:", error);
    return NextResponse.json(
      { error: "Failed to create priority order" },
      { status: 500 }
    );
  }
} 