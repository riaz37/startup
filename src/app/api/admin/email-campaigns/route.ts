import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { z } from "zod";

const emailCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  templateId: z.string().min(1, "Template is required"),
  status: z.enum([
    "DRAFT",
    "SCHEDULED", 
    "SENDING",
    "COMPLETED",
    "PAUSED",
    "CANCELLED"
  ]).default("DRAFT"),
  targetAudience: z.enum([
    "ALL_USERS",
    "CUSTOMERS_ONLY",
    "ADMIN_USERS",
    "SPECIFIC_USERS",
    "FILTERED_USERS"
  ]),
  targetFilters: z.record(z.any()).optional(),
  scheduledAt: z.string().datetime().optional()
});

const updateCampaignSchema = emailCampaignSchema.partial();

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const targetAudience = searchParams.get("targetAudience");
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (targetAudience) {
      where.targetAudience = targetAudience;
    }
    
    const campaigns = await prisma.emailCampaign.findMany({
      where,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            deliveries: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return NextResponse.json({ campaigns });
  } catch (error: any) {
    console.error("Error fetching email campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch email campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    
    const body = await request.json();
    const validatedData = emailCampaignSchema.parse(body);
    
    // Check if template exists
    const template = await prisma.emailTemplate.findUnique({
      where: { id: validatedData.templateId }
    });
    
    if (!template) {
      return NextResponse.json(
        { error: "Email template not found" },
        { status: 400 }
      );
    }
    
    // Parse scheduledAt if provided
    let scheduledAt = undefined;
    if (validatedData.scheduledAt) {
      scheduledAt = new Date(validatedData.scheduledAt);
    }
    
    const campaign = await prisma.emailCampaign.create({
      data: {
        ...validatedData,
        scheduledAt,
        createdBy: user.id
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating email campaign:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create email campaign" },
      { status: 500 }
    );
  }
} 