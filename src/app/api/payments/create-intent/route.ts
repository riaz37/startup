import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib";
import { prisma } from "@/lib";
import { createPaymentIntent } from "@/lib/payment";
import { PaymentMethod } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    // Check if order is already paid
    if (order.paymentStatus === "COMPLETED") {
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        currency: "BDT",
        paymentMethod: PaymentMethod.CARD,
        gatewayProvider: "stripe",
        status: "PENDING",
      },
    });

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(
      order.id,
      order.totalAmount,
      {
        userId: user.id,
        paymentId: payment.id,
        productName: order.groupOrder.product.name,
      }
    );

    // Update payment with gateway order ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayOrderId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: order.totalAmount,
              currency: "BDT",
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
} 