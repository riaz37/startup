import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireAdmin } from "@/lib";
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
    const deliveryType = searchParams.get("deliveryType");
    const userId = searchParams.get("userId");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, any> = {};
    
    // Users can only see their own deliveries, admins can see all
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      if (userId) {
        where.order = { userId };
      }
    } else {
      where.order = { userId: user.id };
    }

    if (status) {
      where.status = status;
    }

    if (deliveryType) {
      where.deliveryType = deliveryType;
    }

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        include: {
          order: {
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
                    },
                  },
                },
              },
            },
          },
          pickupLocation: true,
        },
        orderBy: {
          scheduledDate: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.delivery.count({ where }),
    ]);

    return NextResponse.json({
      deliveries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = await request.json();
    const { 
      orderId, 
      deliveryType, 
      pickupLocationId, 
      deliveryAddress, 
      scheduledDate, 
      notes 
    } = body;

    // Validate required fields
    if (!orderId || !deliveryType || !scheduledDate) {
      return NextResponse.json(
        { error: "Order ID, delivery type, and scheduled date are required" },
        { status: 400 }
      );
    }

    // Validate order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        groupOrder: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Validate pickup location if pickup delivery
    if (deliveryType === "PICKUP" && pickupLocationId) {
      const pickupLocation = await prisma.pickupLocation.findUnique({
        where: { id: pickupLocationId },
      });

      if (!pickupLocation) {
        return NextResponse.json(
          { error: "Pickup location not found" },
          { status: 404 }
        );
      }
    }

    // Validate delivery address if home delivery
    if (deliveryType === "HOME_DELIVERY" && !deliveryAddress) {
      return NextResponse.json(
        { error: "Delivery address is required for home delivery" },
        { status: 400 }
      );
    }

    // Create delivery record
    const delivery = await prisma.delivery.create({
      data: {
        orderId,
        deliveryType,
        pickupLocationId: deliveryType === "PICKUP" ? pickupLocationId : null,
        deliveryAddress: deliveryType === "HOME_DELIVERY" ? deliveryAddress : null,
        scheduledDate: new Date(scheduledDate),
        status: "PENDING",
        notes,
      },
      include: {
        order: {
          include: {
            user: true,
            groupOrder: {
              include: {
                product: true,
              },
            },
          },
        },
        pickupLocation: true,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PROCESSING",
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: "DELIVERY_SCHEDULED",
        title: "Delivery Scheduled",
        message: `Your delivery for ${order.groupOrder.product.name} has been scheduled for ${new Date(scheduledDate).toLocaleDateString()}.`,
        data: { orderId, deliveryId: delivery.id },
      },
    });

    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    console.error("Error creating delivery:", error);
    return NextResponse.json(
      { error: "Failed to create delivery" },
      { status: 500 }
    );
  }
} 