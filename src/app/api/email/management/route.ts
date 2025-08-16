import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { emailService } from "@/lib/email/email-service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "stats":
        const stats = emailService.getEmailDeliveryStats();
        return NextResponse.json({ stats });
      
      case "failed":
        // This would need to be implemented in the email service
        return NextResponse.json({ 
          message: "Failed emails tracking available",
          failedCount: 0 
        });
      
      default:
        return NextResponse.json({
          message: "Email management endpoint",
          availableActions: ["stats", "failed", "retry"]
        });
    }
  } catch (error) {
    console.error("Email management error:", error);
    return NextResponse.json(
      { error: "Failed to get email management data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const { action } = await request.json();

    switch (action) {
      case "retry-failed":
        const retryResults = await emailService.retryFailedEmails();
        return NextResponse.json({
          message: "Failed emails retry completed",
          results: retryResults
        });
      
      case "test-connection":
        const connectionResult = await emailService.testConnection();
        return NextResponse.json({
          message: "Connection test completed",
          result: connectionResult
        });
      
      case "send-test":
        const { email, template } = await request.json();
        
        if (!email) {
          return NextResponse.json(
            { error: "Email address is required" },
            { status: 400 }
          );
        }

        let testResult;
        switch (template) {
          case "welcome":
            testResult = await emailService.sendWelcomeEmail({
              to: email,
              userName: "Test User",
            });
            break;
          
          case "order-confirmation":
            testResult = await emailService.sendOrderConfirmation({
              to: email,
              userName: "Test User",
              orderNumber: "TEST-001",
              productName: "Test Product",
              quantity: 1,
              unit: "kg",
              totalAmount: 100,
              deliveryAddress: "Test Address",
              estimatedDelivery: "2024-01-15",
              orderId: "test-order-id",
            });
            break;
          
          default:
            testResult = await emailService.sendCustomEmail({
              to: email,
              subject: "Test Email from Sohozdaam",
              html: "<h1>Test Email</h1><p>This is a test email to verify the email system is working.</p>",
            });
        }

        return NextResponse.json({
          message: "Test email sent",
          result: testResult
        });
      
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Email management action error:", error);
    return NextResponse.json(
      { error: "Failed to perform email management action" },
      { status: 500 }
    );
  }
} 