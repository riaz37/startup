import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { quantity, addressId } = body;

    // Validate group order exists and is active
    const groupOrder = await prisma.groupOrder.findUnique({
      where: { id: params.id },
      include: {
        product: true
      }
    });

    if (!groupOrder) {
      return NextResponse.json(
        { error: "Group order not found" },
        { status: 404 }
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
        userId: user.id
      }
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
        groupOrderId: params.id
      }
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
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(3, '0')}`;

    // Create order in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          groupOrderId: params.id,
          addressId,
          orderNumber,
          totalAmount,
          status: "PENDING",
          paymentStatus: "PENDING"
        }
      });

      // Create order item
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: groupOrder.productId,
          quantity: requestedQuantity,
          unitPrice: groupOrder.pricePerUnit,
          totalPrice: totalAmount
        }
      });

      // Update group order totals
      await tx.groupOrder.update({
        where: { id: params.id },
        data: {
          currentAmount: {
            increment: totalAmount
          },
          currentQuantity: {
            increment: requestedQuantity
          }
        }
      });

      return order;
    });

    // Check if threshold is met
    const updatedGroupOrder = await prisma.groupOrder.findUnique({
      where: { id: params.id }
    });

    if (updatedGroupOrder && updatedGroupOrder.currentAmount >= updatedGroupOrder.minThreshold) {
      await prisma.groupOrder.update({
        where: { id: params.id },
        data: { status: "THRESHOLD_MET" }
      });
    }

    return NextResponse.json({
      message: "Successfully joined group order",
      order: result
    }, { status: 201 });
  } catch (error) {
    console.error("Error joining group order:", error);
    return NextResponse.json(
      { error: "Failed to join group order" },
      { status: 500 }
    );
  }
}