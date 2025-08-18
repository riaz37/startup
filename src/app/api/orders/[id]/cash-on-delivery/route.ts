import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib";
import { prisma } from "@/lib";
import { emailService } from "@/lib/email";

export async function POST(
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

    // Fetch order details
    const order = await prisma.order.findUnique({
      where: { id: id },
      include: {
        user: true,
        groupOrder: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order belongs to user
    if (order.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to order" },
        { status: 403 }
      );
    }

    // Check if order is already processed
    if (order.paymentStatus === "COMPLETED" || order.paymentStatus === "CASH_ON_DELIVERY") {
      return NextResponse.json(
        { error: "Order is already processed" },
        { status: 400 }
      );
    }

    // Process cash on delivery order
    const result = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: id },
        data: {
          paymentStatus: "CASH_ON_DELIVERY" as any,
          paymentMethod: "CASH_ON_DELIVERY" as any,
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      });

      // Create payment record for cash on delivery
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          currency: "BDT",
          paymentMethod: "CASH_ON_DELIVERY" as any,
          gatewayProvider: null as any, // No gateway for COD
          status: "CASH_ON_DELIVERY" as any,
          processedAt: new Date(),
        },
      });

      return updatedOrder;
    });

    // Send confirmation email
    try {
      if (order.groupOrder) {
        await emailService.sendOrderConfirmation({
          to: order.user.email,
          userName: order.user.name,
          orderNumber: order.orderNumber,
          productName: order.groupOrder.product.name,
          quantity: 1, // Default quantity, can be enhanced later
          unit: order.groupOrder.product.unit,
          totalAmount: order.totalAmount,
          deliveryAddress: `${order.address.addressLine1}, ${order.address.city}, ${order.address.state} ${order.address.pincode}`,
          estimatedDelivery: order.groupOrder.estimatedDelivery?.toLocaleDateString() || 'TBD',
          orderId: order.id,
        });
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: "Cash on delivery order confirmed successfully",
      order: result,
    });
  } catch (error) {
    console.error("Error processing cash on delivery order:", error);
    return NextResponse.json(
      { error: "Failed to process cash on delivery order" },
      { status: 500 }
    );
  }
} 