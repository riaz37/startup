import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireAdmin } from "@/lib";
import { prisma } from "@/lib";

// GET /api/priority-orders/[id] - Get priority order by ID
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
    const priorityOrder = await prisma.priorityOrder.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true,
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
        items: true,
      },
    });

    if (!priorityOrder) {
      return NextResponse.json(
        { error: "Priority order not found" },
        { status: 404 }
      );
    }

    // Users can only view their own priority orders, admins can view all
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      if (priorityOrder.userId !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized access to priority order" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ priorityOrder });
  } catch (error) {
    console.error("Error fetching priority order:", error);
    return NextResponse.json(
      { error: "Failed to fetch priority order" },
      { status: 500 }
    );
  }
}

// PATCH /api/priority-orders/[id] - Update priority order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { 
      status, 
      estimatedDelivery, 
      actualDelivery, 
      notes,
      deliveryType,
      pickupLocationId 
    } = await request.json();

    const { id } = await params;
    const priorityOrder = await prisma.priorityOrder.findUnique({
      where: { id },
      include: {
        user: true,
        product: true,
        delivery: true,
      },
    });

    if (!priorityOrder) {
      return NextResponse.json(
        { error: "Priority order not found" },
        { status: 404 }
      );
    }

    // Update priority order
    const updatedPriorityOrder = await prisma.priorityOrder.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
        ...(actualDelivery && { actualDelivery: new Date(actualDelivery) }),
        ...(notes && { notes }),
      },
      include: {
        product: true,
        user: true,
        address: true,
        delivery: {
          include: {
            pickupLocation: true,
          },
        },
      },
    });

    // Update or create delivery record
    if (deliveryType || pickupLocationId) {
      if (priorityOrder.delivery) {
        await prisma.priorityDelivery.update({
          where: { id: priorityOrder.delivery.id },
          data: {
            ...(deliveryType && { deliveryType }),
            ...(pickupLocationId && { pickupLocationId }),
          },
        });
      } else {
        await prisma.priorityDelivery.create({
          data: {
            priorityOrderId: id,
            deliveryType: deliveryType || "HOME_DELIVERY",
            pickupLocationId: pickupLocationId || null,
            status: "PENDING",
          },
        });
      }
    }

    // Update order status based on delivery status
    if (status === "DELIVERED" && !priorityOrder.actualDelivery) {
      await prisma.priorityOrder.update({
        where: { id },
        data: {
          actualDelivery: new Date(),
        },
      });
    }

    // Create notification based on status change
    let notificationMessage = "";
    let notificationTitle = "";
    
    switch (status) {
      case "CONFIRMED":
        notificationTitle = "Priority Order Confirmed";
        notificationMessage = `Your priority order for ${priorityOrder.product.name} has been confirmed.`;
        break;
      case "PROCESSING":
        notificationTitle = "Priority Order Processing";
        notificationMessage = `Your priority order for ${priorityOrder.product.name} is now being processed.`;
        break;
      case "READY":
        notificationTitle = "Priority Order Ready";
        notificationMessage = `Your priority order for ${priorityOrder.product.name} is ready for pickup/delivery.`;
        break;
      case "SHIPPED":
        notificationTitle = "Priority Order Shipped";
        notificationMessage = `Your priority order for ${priorityOrder.product.name} has been shipped.`;
        break;
      case "DELIVERED":
        notificationTitle = "Priority Order Delivered";
        notificationMessage = `Your priority order for ${priorityOrder.product.name} has been delivered successfully.`;
        break;
      case "CANCELLED":
        notificationTitle = "Priority Order Cancelled";
        notificationMessage = `Your priority order for ${priorityOrder.product.name} has been cancelled.`;
        break;
    }

    if (notificationMessage) {
      await prisma.notification.create({
        data: {
          userId: priorityOrder.userId,
          type: "GENERAL",
          title: notificationTitle,
          message: notificationMessage,
          data: { priorityOrderId: id, productName: priorityOrder.product.name },
        },
      });
    }

    return NextResponse.json(updatedPriorityOrder);
  } catch (error) {
    console.error("Error updating priority order:", error);
    return NextResponse.json(
      { error: "Failed to update priority order" },
      { status: 500 }
    );
  }
} 