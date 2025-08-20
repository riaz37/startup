import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { dynamicEmailService } from "@/lib/email/dynamic-email-service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const { 
      templateId, 
      userIds, 
      userFilters, 
      subject, 
      content, 
      scheduledAt,
      batchSize = 50 
    } = await request.json();

    // Validate required fields
    if (!subject || !content) {
      return NextResponse.json(
        { error: "Subject and content are required" },
        { status: 400 }
      );
    }

    // Get template if templateId is provided
    let template = null;
    if (templateId) {
      template = await prisma.emailTemplate.findUnique({
        where: { id: templateId, isActive: true }
      });
      
      if (!template) {
        return NextResponse.json(
          { error: "Template not found or inactive" },
          { status: 400 }
        );
      }
    }

    // Get target users based on provided criteria
    let targetUsers: any[] = [];

    if (userIds && userIds.length > 0) {
      // Send to specific users
      targetUsers = await prisma.user.findMany({
        where: { 
          id: { in: userIds },
          isActive: true,
          isVerified: true
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      });
    } else if (userFilters) {
      // Send to users matching filters
      const whereClause: any = { 
        isActive: true,
        isVerified: true
      };

      if (userFilters.role) {
        whereClause.role = userFilters.role;
      }

      if (userFilters.createdAfter) {
        whereClause.createdAt = {
          gte: new Date(userFilters.createdAfter)
        };
      }

      if (userFilters.hasOrders) {
        whereClause.orders = {
          some: {}
        };
      }

      if (userFilters.lastLoginAfter) {
        whereClause.lastLoginAt = {
          gte: new Date(userFilters.lastLoginAfter)
        };
      }

      targetUsers = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      });
    } else {
      return NextResponse.json(
        { error: "Either userIds or userFilters must be provided" },
        { status: 400 }
      );
    }

    if (targetUsers.length === 0) {
      return NextResponse.json(
        { error: "No users found matching the criteria" },
        { status: 400 }
      );
    }

    // Create bulk email campaign record
    const campaign = await prisma.emailCampaign.create({
      data: {
        name: `Bulk Email - ${subject}`,
        description: `Bulk email sent to ${targetUsers.length} users`,
        templateId: templateId || null,
        status: scheduledAt ? 'SCHEDULED' : 'SENDING',
        targetAudience: 'FILTERED_USERS',
        targetFilters: userFilters || {},
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdBy: user.id,
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0
      }
    });

    // Process emails in batches
    const results = {
      campaignId: campaign.id,
      totalUsers: targetUsers.length,
      batches: [] as any[],
      summary: {
        total: targetUsers.length,
        sent: 0,
        failed: 0,
        skipped: 0
      }
    };

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < targetUsers.length; i += batchSize) {
      const batch = targetUsers.slice(i, i + batchSize);
      const batchResults = [];

      // Process batch concurrently
      await Promise.all(
        batch.map(async (user) => {
          try {
            // Check if user already received this email recently (avoid spam)
            const recentEmail = await prisma.emailDelivery.findFirst({
              where: {
                userId: user.id,
                subject: subject,
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
              }
            });

            if (recentEmail) {
              results.summary.skipped++;
              batchResults.push({
                userId: user.id,
                email: user.email,
                status: 'skipped',
                reason: 'Duplicate email within 24 hours'
              });
              return;
            }

            // Send email
            let emailResult;
            
            if (template) {
              // Use template-based sending
              emailResult = await dynamicEmailService.sendCustomEmail(
                template.name,
                {
                  userName: user.name || 'User'
                },
                user.email,
                user.id,
                campaign.id
              );
            } else {
              // Use raw content - we'll need to create a temporary delivery record
              // For now, let's create a simple email sending method
              emailResult = await dynamicEmailService.sendEmailWithTemplate(
                'Custom Email',
                {
                  userName: user.name || 'User',
                  subject: subject,
                  content: content
                },
                user.email,
                user.id,
                campaign.id
              );
            }

            if (emailResult.success) {
              results.summary.sent++;
              batchResults.push({
                userId: user.id,
                email: user.email,
                status: 'sent',
                emailId: emailResult.emailId || 'unknown'
              });
            } else {
              results.summary.failed++;
              batchResults.push({
                userId: user.id,
                email: user.email,
                status: 'failed',
                error: emailResult.error?.toString() || 'Unknown error'
              });
            }
          } catch (error) {
            results.summary.failed++;
            batchResults.push({
              userId: user.id,
              email: user.email,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        })
      );

      results.batches.push({
        batchNumber: Math.floor(i / batchSize) + 1,
        users: batchResults
      });

      // Update campaign progress
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: {
          totalSent: results.summary.sent,
          totalFailed: results.summary.failed
        }
      });

      // Small delay between batches to avoid overwhelming the email service
      if (i + batchSize < targetUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: {
        status: 'COMPLETED',
        sentAt: new Date()
      }
    });

    return NextResponse.json({
      message: "Bulk email operation completed",
      results
    });

  } catch (error) {
    console.error("Bulk email error:", error);
    return NextResponse.json(
      { error: "Failed to send bulk emails" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "user-count":
        // Get count of users matching filters
        const { filters } = await request.json();
        
        const whereClause: any = { 
          isActive: true,
          isVerified: true
        };

        if (filters.role) {
          whereClause.role = filters.role;
        }

        if (filters.createdAfter) {
          whereClause.createdAt = {
            gte: new Date(filters.createdAfter)
          };
        }

        if (filters.hasOrders) {
          whereClause.orders = {
            some: {}
          };
        }

        const userCount = await prisma.user.count({
          where: whereClause
        });

        return NextResponse.json({ userCount });

      case "preview":
        // Get preview of users that would receive the email
        const { previewFilters, limit = 10 } = await request.json();
        
        const previewWhereClause: any = { 
          isActive: true,
          isVerified: true
        };

        if (previewFilters.role) {
          previewWhereClause.role = previewFilters.role;
        }

        if (previewFilters.createdAfter) {
          previewWhereClause.createdAt = {
            gte: new Date(previewFilters.createdAfter)
          };
        }

        if (previewFilters.hasOrders) {
          previewWhereClause.orders = {
            some: {}
          };
        }

        const previewUsers = await prisma.user.findMany({
          where: previewWhereClause,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            lastLoginAt: true
          },
          take: limit,
          orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ previewUsers });

      default:
        return NextResponse.json({
          message: "Bulk email endpoint",
          availableActions: ["user-count", "preview"]
        });
    }
  } catch (error) {
    console.error("Bulk email GET error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk email request" },
      { status: 500 }
    );
  }
} 