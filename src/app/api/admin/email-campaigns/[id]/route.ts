import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib";
import { prisma } from "@/lib/database";
import { z } from "zod";

const updateCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").optional(),
  description: z.string().optional(),
  templateId: z.string().min(1, "Template is required").optional(),
  status: z.enum([
    "DRAFT",
    "SCHEDULED", 
    "SENDING",
    "COMPLETED",
    "PAUSED",
    "CANCELLED"
  ]).optional(),
  targetAudience: z.enum([
    "ALL_USERS",
    "CUSTOMERS_ONLY",
    "ADMIN_USERS",
    "SPECIFIC_USERS",
    "FILTERED_USERS"
  ]).optional(),
  targetFilters: z.record(z.unknown()).optional(),
  scheduledAt: z.string().datetime().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
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
      }
    });
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Email campaign not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Error fetching email campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch email campaign" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCampaignSchema.parse(body);
    
    // Check if campaign exists
    const existingCampaign = await prisma.emailCampaign.findUnique({
      where: { id }
    });
    
    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Email campaign not found" },
        { status: 404 }
      );
    }
    
    // If template is being updated, check if it exists
    if (validatedData.templateId) {
      const template = await prisma.emailTemplate.findUnique({
        where: { id: validatedData.templateId }
      });
      
      if (!template) {
        return NextResponse.json(
          { error: "Email template not found" },
          { status: 400 }
        );
      }
    }
    
    // Parse scheduledAt if provided
    let scheduledAt = undefined;
    if (validatedData.scheduledAt) {
      scheduledAt = new Date(validatedData.scheduledAt);
    }
    
    const updatedCampaign = await prisma.emailCampaign.update({
      where: { id },
      data: {
        ...validatedData,
        scheduledAt
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
    
    return NextResponse.json({ campaign: updatedCampaign });
  } catch (error) {
    console.error("Error updating email campaign:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update email campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    
    // Check if campaign exists
    const existingCampaign = await prisma.emailCampaign.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            deliveries: true
          }
        }
      }
    });
    
    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Email campaign not found" },
        { status: 404 }
      );
    }
    
    // Check if campaign is currently sending
    if (existingCampaign.status === "SENDING") {
      return NextResponse.json(
        { error: "Cannot delete campaign that is currently sending" },
        { status: 400 }
      );
    }
    
    // Check if campaign has deliveries
    if (existingCampaign._count.deliveries > 0) {
      return NextResponse.json(
        { error: "Cannot delete campaign that has email deliveries" },
        { status: 400 }
      );
    }
    
    await prisma.emailCampaign.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Email campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting email campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete email campaign" },
      { status: 500 }
    );
  }
} 