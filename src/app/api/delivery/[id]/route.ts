import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireAdmin } from "@/lib";
import { prisma } from "@/lib";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: true,
            groupOrder: {
              include: {
                product: true,
              },
            },
            address: true,
          },
        },
        pickupLocation: true,
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    // Users can only view their own deliveries, admins can view all
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      if (delivery.order.userId !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized access to delivery" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ delivery });
  } catch (error) {
    console.error("Error fetching delivery:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { status, actualDeliveryDate, trackingNumber, notes } = await request.json();

    const { id } = await params;
    const delivery = await prisma.delivery.findUnique({
      where: { id },
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
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    // Update delivery
    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: {
        status,
        ...(actualDeliveryDate && { actualDeliveryDate: new Date(actualDeliveryDate) }),
        ...(trackingNumber && { trackingNumber }),
        ...(notes && { notes }),
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

    // Update order status based on delivery status
    if (status === "DELIVERED") {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
        },
      });
    } else if (status === "IN_TRANSIT") {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: {
          status: "SHIPPED",
        },
      });
    }

    // Create notification
    let notificationMessage = "";
    let notificationTitle = "";
    
    switch (status) {
      case "IN_TRANSIT":
        notificationTitle = "Delivery Started";
        notificationMessage = `Your delivery for ${delivery.order.groupOrder.product.name} is now in transit.`;
        break;
      case "DELIVERED":
        notificationTitle = "Delivery Completed";
        notificationMessage = `Your delivery for ${delivery.order.groupOrder.product.name} has been completed successfully.`;
        break;
      case "FAILED":
        notificationTitle = "Delivery Failed";
        notificationMessage = `Your delivery for ${delivery.order.groupOrder.product.name} could not be completed. Please contact support.`;
        break;
    }

    if (notificationMessage) {
      await prisma.notification.create({
        data: {
          userId: delivery.order.userId,
          type: "GENERAL",
          title: notificationTitle,
          message: notificationMessage,
          data: { orderId: delivery.orderId, deliveryId: delivery.id, status },
        },
      });
    }

    return NextResponse.json({
      message: "Delivery updated successfully",
      delivery: updatedDelivery,
    });
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json(
      { error: "Failed to update delivery" },
      { status: 500 }
    );
  }
} 