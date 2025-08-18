import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib";
import { prisma } from "@/lib";
import { refundPayment } from "@/lib/payment";


export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const { paymentIntentId, amount, reason } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: { gatewayOrderId: paymentIntentId },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if payment can be refunded
    if (payment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment cannot be refunded in current status" },
        { status: 400 }
      );
    }

    // Process refund through Stripe
    const refund = await refundPayment(paymentIntentId, amount, reason);

    // Update payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "REFUNDED",
        refundedAt: new Date(),
        refundAmount: amount || payment.amount,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: "REFUNDED",
        paymentStatus: "REFUNDED",
      },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: payment.order.userId,
        type: "GENERAL",
        title: "Payment Refunded",
        message: `Your payment of ৳${amount || payment.amount} has been refunded${reason ? `: ${reason}` : ''}.`,
        data: { 
          orderId: payment.orderId, 
          amount: amount || payment.amount,
          reason 
        },
      },
    });

    return NextResponse.json({
      message: "Refund processed successfully",
      refund,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
} 