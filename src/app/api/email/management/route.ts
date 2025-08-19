import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { emailService } from "@/lib/email/email-service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "stats":
        // Get real email delivery statistics from database
        const stats = await emailService.getEmailDeliveryStats();
        return NextResponse.json({ stats });
      
      case "failed":
        // Get real failed emails from database
        const failedEmails = await prisma.emailDelivery.findMany({
          where: { status: 'FAILED' },
          include: {
            template: {
              select: { name: true }
            },
            user: {
              select: { name: true, email: true }
            }
          },
          orderBy: { failedAt: 'desc' },
          take: 50 // Limit to last 50 failed emails
        });

        const failedEmailsFormatted = failedEmails.map(email => ({
          id: email.id,
          to: email.to,
          subject: email.subject,
          template: email.template?.name || 'Unknown',
          error: email.error || 'Unknown error',
          retryCount: email.retryCount,
          maxRetries: email.maxRetries,
          failedAt: email.failedAt,
          userName: email.user?.name || 'Unknown'
        }));

        return NextResponse.json({ 
          failedEmails: failedEmailsFormatted,
          failedCount: failedEmailsFormatted.length
        });
      
      case "templates":
        // Get real email templates from database
        const templates = await prisma.emailTemplate.findMany({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ templates });
      
      case "recent-deliveries":
        // Get recent email deliveries from database
        const recentDeliveries = await prisma.emailDelivery.findMany({
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            template: {
              select: { name: true }
            }
          }
        });

        const formattedDeliveries = recentDeliveries.map(delivery => ({
          id: delivery.id,
          to: delivery.to,
          subject: delivery.subject,
          template: delivery.template?.name || 'Unknown',
          status: delivery.status.toLowerCase(),
          sentAt: delivery.sentAt?.toISOString(),
          deliveredAt: delivery.deliveredAt?.toISOString(),
          retryCount: delivery.retryCount,
          error: delivery.error
        }));

        return NextResponse.json({ deliveries: formattedDeliveries });
      
      default:
        return NextResponse.json({
          message: "Email management endpoint",
          availableActions: ["stats", "failed", "templates", "recent-deliveries"]
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
    const { action, ...data } = await request.json();

    switch (action) {
      case "retry-failed":
        // Get failed emails that haven't exceeded max retries
        const failedEmails = await prisma.emailDelivery.findMany({
          where: { 
            status: 'FAILED',
            retryCount: { lt: 3 } // Max 3 retries
          }
        });

        const retryResults = [];
        
        for (const email of failedEmails) {
          try {
            // Update retry count and status
            await prisma.emailDelivery.update({
              where: { id: email.id },
              data: {
                retryCount: { increment: 1 },
                status: 'PENDING',
                failedAt: null,
                error: null
              }
            });

            retryResults.push({
              emailId: email.id,
              success: true,
              message: 'Email queued for retry'
            });
          } catch (error) {
            retryResults.push({
              emailId: email.id,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }

        return NextResponse.json({
          message: "Failed emails retry completed",
          results: retryResults
        });
      
      case "test-connection":
        // Test SMTP connection using the email service
        const connectionResult = await emailService.testConnection();
        
        return NextResponse.json({
          message: "Connection test completed",
          result: connectionResult
        });
      
      case "send-test":
        const { email, template } = data;
        
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