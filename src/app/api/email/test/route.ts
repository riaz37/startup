import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { emailService } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    // Only admins can test email service
    const user = await requireAdmin();
    
    const { email, type } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "connection":
        result = await emailService.testConnection();
        break;
      
      case "welcome":
        result = await emailService.sendWelcomeEmail({
          to: email,
          userName: "Test User",
        });
        break;
      
      case "order-confirmation":
        result = await emailService.sendOrderConfirmation({
          to: email,
          userName: "Test User",
          orderNumber: "ORD-2024-001",
          productName: "Basmati Rice",
          quantity: 5,
          unit: "kg",
          totalAmount: 420,
          deliveryAddress: "123 Test Street, Test City, 123456",
          estimatedDelivery: "2024-01-15",
          orderId: "test-order-id",
        });
        break;
      
      case "payment-success":
        result = await emailService.sendPaymentSuccess({
          to: email,
          userName: "Test User",
          orderNumber: "ORD-2024-001",
          amount: 420,
          paymentMethod: "Credit Card",
          orderId: "test-order-id",
        });
        break;
      
      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        message: `Email test (${type}) completed successfully`,
        result,
      });
    } else {
      return NextResponse.json(
        { error: "Email test failed", result },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      { error: "Failed to test email service" },
      { status: 500 }
    );
  }
} 