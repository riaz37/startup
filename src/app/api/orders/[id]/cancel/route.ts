import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib";
import { prisma } from "@/lib";

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

    const { reason } = await request.json();
    const { id: orderId } = await params;

    // Fetch order with related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        groupOrder: {
          include: {
            product: true,
          },
        },
        items: true,
        payments: {
          where: { status: "COMPLETED" },
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

    // Check permissions
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      if (order.userId !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized access to order" },
          { status: 403 }
        );
      }
    }

    // Check if order can be cancelled
    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Order is already cancelled" },
        { status: 400 }
      );
    }

    if (order.status === "DELIVERED") {
      return NextResponse.json(
        { error: "Cannot cancel delivered order" },
        { status: 400 }
      );
    }

    // Check if payment was made
    const hasPayment = order.payments.length > 0;

    // Cancel order with transaction
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          ...(hasPayment && { paymentStatus: "REFUNDED" }),
        },
      });

      // Update group order totals if group order exists
      if (order.groupOrderId) {
        await tx.groupOrder.update({
          where: { id: order.groupOrderId },
          data: {
            currentAmount: {
              decrement: order.totalAmount,
            },
            currentQuantity: {
              decrement: order.items[0]?.quantity || 1,
            },
          },
        });
      }

      // If payment was made, create refund record
      if (hasPayment) {
        await tx.payment.updateMany({
          where: { orderId },
          data: {
            status: "REFUNDED",
            refundedAt: new Date(),
            refundAmount: order.totalAmount,
          },
        });
      }

      return updatedOrder;
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: "ORDER_CANCELLED",
        title: "Order Cancelled",
        message: `Your order ${order.orderNumber} has been cancelled${reason ? `: ${reason}` : ''}.`,
        data: { orderId, reason },
      },
    });

    // Send cancellation email
    try {
      const { emailService } = await import("@/lib/email");
      await emailService.sendCustomEmail({
        to: order.user.email,
        subject: `Order Cancelled - ${order.orderNumber}`,
        html: `
          <h2>Order Cancelled</h2>
          <p>Hi ${order.user.name},</p>
          <p>Your order <strong>${order.orderNumber}</strong> has been cancelled.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you had made a payment, it will be refunded within 5-7 business days.</p>
          <p>Thank you for your understanding.</p>
        `,
      });
    } catch (error) {
      console.error("Error sending cancellation email:", error);
    }

    return NextResponse.json({
      message: "Order cancelled successfully",
      order: cancelledOrder,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
} 