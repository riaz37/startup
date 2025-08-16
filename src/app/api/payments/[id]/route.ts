import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireAdmin } from "@/lib";
import { prisma } from "@/lib";
import { getPaymentDetails, cancelPaymentIntent, updatePaymentIntent } from "@/lib";

export async function GET(
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

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
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

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Users can only view their own payments, admins can view all
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      if (payment.order.userId !== user.id) {
        return NextResponse.json(
          { error: "Unauthorized access to payment" },
          { status: 403 }
        );
      }
    }

    // Get Stripe payment details if available
    let stripeDetails = null;
    if (payment.gatewayOrderId) {
      try {
        stripeDetails = await getPaymentDetails(payment.gatewayOrderId);
      } catch (error) {
        console.error("Error fetching Stripe details:", error);
      }
    }

    return NextResponse.json({
      payment,
      stripeDetails,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin();
    const { action, ...data } = await request.json();

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    let result;

    switch (action) {
      case "cancel":
        if (payment.gatewayOrderId) {
          result = await cancelPaymentIntent(payment.gatewayOrderId);
          
          // Update payment status
          await prisma.payment.update({
            where: { id: params.id },
            data: {
              status: "FAILED",
              failureReason: "Cancelled by admin",
            },
          });
        }
        break;

      case "update":
        if (payment.gatewayOrderId) {
          result = await updatePaymentIntent(payment.gatewayOrderId, data);
        }
        break;

      case "update_status":
        await prisma.payment.update({
          where: { id: params.id },
          data: {
            status: data.status,
            ...(data.failureReason && { failureReason: data.failureReason }),
          },
        });
        result = { success: true };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Payment ${action} completed successfully`,
      result,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
} 