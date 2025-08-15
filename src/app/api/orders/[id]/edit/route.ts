import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

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

    const { quantity, addressId, notes } = await request.json();
    const orderId = params.id;

    // Fetch order with related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        groupOrder: {
          include: {
            product: true,
          },
        },
        address: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      if (order.userId !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized access to order" },
          { status: 403 }
        );
      }
    }

    // Check if order can be edited
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Order cannot be edited in current status" },
        { status: 400 }
      );
    }

    // Check if payment was made
    if (order.paymentStatus === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot edit paid order" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    let needsRecalculation = false;

    // Update quantity if provided
    if (quantity !== undefined) {
      const requestedQuantity = parseInt(quantity);
      
      if (requestedQuantity < order.groupOrder.product.minOrderQty) {
        return NextResponse.json(
          { error: `Minimum order quantity is ${order.groupOrder.product.minOrderQty}` },
          { status: 400 }
        );
      }

      if (order.groupOrder.product.maxOrderQty && requestedQuantity > order.groupOrder.product.maxOrderQty) {
        return NextResponse.json(
          { error: `Maximum order quantity is ${order.groupOrder.product.maxOrderQty}` },
          { status: 400 }
        );
      }

      const currentQuantity = order.items[0]?.quantity || 1;
      const quantityDifference = requestedQuantity - currentQuantity;
      
      if (quantityDifference !== 0) {
        needsRecalculation = true;
        updateData.totalAmount = requestedQuantity * order.groupOrder.pricePerUnit;
      }
    }

    // Update address if provided
    if (addressId !== undefined) {
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

      updateData.addressId = addressId;
    }

    // Update notes if provided
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update order with transaction if needed
    let updatedOrder;
    
    if (needsRecalculation) {
      updatedOrder = await prisma.$transaction(async (tx) => {
        // Update order
        const orderUpdate = await tx.order.update({
          where: { id: orderId },
          data: updateData,
          include: {
            groupOrder: {
              include: {
                product: true,
              },
            },
            address: true,
            items: true,
          },
        });

        // Update order item
        if (quantity !== undefined) {
          const requestedQuantity = parseInt(quantity);
          await tx.orderItem.updateMany({
            where: { orderId },
            data: {
              quantity: requestedQuantity,
              totalPrice: requestedQuantity * order.groupOrder.pricePerUnit,
            },
          });
        }

        // Update group order totals
        const currentQuantity = order.items[0]?.quantity || 1;
        const requestedQuantity = parseInt(quantity);
        const quantityDifference = requestedQuantity - currentQuantity;
        const amountDifference = quantityDifference * order.groupOrder.pricePerUnit;

        await tx.groupOrder.update({
          where: { id: order.groupOrderId },
          data: {
            currentAmount: {
              increment: amountDifference,
            },
            currentQuantity: {
              increment: quantityDifference,
            },
          },
        });

        return orderUpdate;
      });
    } else {
      // Simple update without recalculation
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          groupOrder: {
            include: {
              product: true,
            },
          },
          address: true,
          items: true,
        },
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: "ORDER_CONFIRMATION",
        title: "Order Updated",
        message: `Your order ${order.orderNumber} has been updated successfully.`,
        data: { orderId, updates: updateData },
      },
    });

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