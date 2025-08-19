import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib";
import { prisma } from "@/lib/database";
import { sendEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const testMode = searchParams.get("test") === "true";
    const testEmail = searchParams.get("testEmail");
    
    // Get campaign details
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
      include: {
        template: true
      }
    });
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }
    
    if (campaign.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Campaign has already been completed" },
        { status: 400 }
      );
    }
    
    // Update campaign status to sending
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: { status: "SENDING" }
    });
    
    let targetUsers: any[] = [];
    
    // Get target users based on audience
    switch (campaign.targetAudience) {
      case "ALL_USERS":
        targetUsers = await prisma.user.findMany({
          where: { isActive: true },
          select: { id: true, email: true, name: true }
        });
        break;
        
      case "CUSTOMERS_ONLY":
        targetUsers = await prisma.user.findMany({
          where: { 
            isActive: true,
            role: "CUSTOMER"
          },
          select: { id: true, email: true, name: true }
        });
        break;
        
      case "ADMIN_USERS":
        targetUsers = await prisma.user.findMany({
          where: { 
            isActive: true,
            role: { in: ["ADMIN", "SUPER_ADMIN"] }
          },
          select: { id: true, email: true, name: true }
        });
        break;
        
      case "FILTERED_USERS":
        if (campaign.targetFilters) {
          const filters = campaign.targetFilters as any;
          const where: any = { isActive: true };
          
          if (filters.role) {
            where.role = filters.role;
          }
          
          if (filters.isVerified !== undefined) {
            where.isVerified = filters.isVerified;
          }
          
          targetUsers = await prisma.user.findMany({
            where,
            select: { id: true, email: true, name: true }
          });
        }
        break;
        
      default:
        targetUsers = [];
    }
    
    if (testMode && testEmail) {
      // Test mode - send to single email
      targetUsers = [{ id: "test", email: testEmail, name: "Test User" }];
    }
    
    if (targetUsers.length === 0) {
      await prisma.emailCampaign.update({
        where: { id: params.id },
        data: { status: "DRAFT" }
      });
      
      return NextResponse.json(
        { error: "No target users found for this campaign" },
        { status: 400 }
      );
    }
    
    let successCount = 0;
    let failureCount = 0;
    
    // Process emails in batches
    const batchSize = 10;
    for (let i = 0; i < targetUsers.length; i += batchSize) {
      const batch = targetUsers.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (user) => {
          try {
            // Replace template variables
            let content = campaign.template.content;
            let subject = campaign.template.subject;
            
            // Simple variable replacement
            content = content.replace(/\{\{userName\}\}/g, user.name || "User");
            content = content.replace(/\{\{userEmail\}\}/g, user.email);
            subject = subject.replace(/\{\{userName\}\}/g, user.name || "User");
            
            // Send email
            if (!testMode) {
              await sendEmail({
                to: user.email,
                subject,
                html: content
              });
            }
            
            // Create delivery record
            await prisma.emailDelivery.create({
              data: {
                campaignId: campaign.id,
                templateId: campaign.template.id,
                userId: user.id === "test" ? null : user.id,
                to: user.email,
                subject,
                content,
                status: testMode ? "SENT" : "SENDING"
              }
            });
            
            successCount++;
          } catch (error) {
            console.error(`Failed to send email to ${user.email}:`, error);
            
            // Create failed delivery record
            await prisma.emailDelivery.create({
              data: {
                campaignId: campaign.id,
                templateId: campaign.template.id,
                userId: user.id === "test" ? null : user.id,
                to: user.email,
                subject: campaign.template.subject,
                content: campaign.template.content,
                status: "FAILED",
                error: error instanceof Error ? error.message : "Unknown error"
              }
            });
            
            failureCount++;
          }
        })
      );
      
      // Small delay between batches to avoid overwhelming the email service
      if (i + batchSize < targetUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Update campaign status
    const finalStatus = failureCount === 0 ? "COMPLETED" : "COMPLETED";
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: finalStatus,
        totalSent: successCount + failureCount,
        totalDelivered: successCount,
        totalFailed: failureCount,
        sentAt: new Date()
      }
    });
    
    return NextResponse.json({
      message: "Campaign processed successfully",
      stats: {
        totalProcessed: successCount + failureCount,
        successCount,
        failureCount
      }
    });
    
  } catch (error: any) {
    console.error("Error sending email campaign:", error);
    
    // Reset campaign status on error
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: { status: "DRAFT" }
    });
    
    return NextResponse.json(
      { error: "Failed to send email campaign" },
      { status: 500 }
    );
  }
} 