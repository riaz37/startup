import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib";
import { prisma } from "@/lib/database";
import { z } from "zod";

const updateTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").optional(),
  subject: z.string().min(1, "Subject is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  variables: z.array(z.string()).optional(),
  category: z.enum([
    "WELCOME",
    "ORDER_CONFIRMATION", 
    "PAYMENT_SUCCESS",
    "PAYMENT_FAILED",
    "SHIPPING_UPDATE",
    "DELIVERY_CONFIRMATION",
    "PRICE_ALERT",
    "DISCOUNT_OFFER",
    "NEWSLETTER",
    "CUSTOM"
  ]).optional(),
  isActive: z.boolean().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            campaigns: true,
            deliveries: true
          }
        }
      }
    });
    
    if (!template) {
      return NextResponse.json(
        { error: "Email template not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error fetching email template:", error);
    return NextResponse.json(
      { error: "Failed to fetch email template" },
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
    const validatedData = updateTemplateSchema.parse(body);
    
    // Check if template exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id }
    });
    
    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Email template not found" },
        { status: 404 }
      );
    }
    
    // If name is being updated, check for uniqueness
    if (validatedData.name && validatedData.name !== existingTemplate.name) {
      const nameExists = await prisma.emailTemplate.findUnique({
        where: { name: validatedData.name }
      });
      
      if (nameExists) {
        return NextResponse.json(
          { error: "Template name already exists" },
          { status: 400 }
        );
      }
    }
    
    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id },
      data: validatedData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json({ template: updatedTemplate });
  } catch (error) {
    console.error("Error updating email template:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update email template" },
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
    
    // Check if template exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            campaigns: true,
            deliveries: true
          }
        }
      }
    });
    
    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Email template not found" },
        { status: 404 }
      );
    }
    
    // Check if template is being used
    if (existingTemplate._count.campaigns > 0 || existingTemplate._count.deliveries > 0) {
      return NextResponse.json(
        { error: "Cannot delete template that is being used by campaigns or deliveries" },
        { status: 400 }
      );
    }
    
    await prisma.emailTemplate.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Email template deleted successfully" });
  } catch (error) {
    console.error("Error deleting email template:", error);
    return NextResponse.json(
      { error: "Failed to delete email template" },
      { status: 500 }
    );
  }
} 