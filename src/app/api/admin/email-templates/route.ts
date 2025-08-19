import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib";
import { prisma } from "@/lib/database";
import { z } from "zod";

const emailTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  variables: z.array(z.string()).default([]),
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
  ]),
  isActive: z.boolean().default(true)
});

const updateTemplateSchema = emailTemplateSchema.partial();

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");
    
    const where: {
      category?: "WELCOME" | "ORDER_CONFIRMATION" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SHIPPING_UPDATE" | "DELIVERY_CONFIRMATION" | "PRICE_ALERT" | "DISCOUNT_OFFER" | "NEWSLETTER" | "CUSTOM";
      isActive?: boolean;
    } = {};
    
    if (category) {
      where.category = category as "WELCOME" | "ORDER_CONFIRMATION" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SHIPPING_UPDATE" | "DELIVERY_CONFIRMATION" | "PRICE_ALERT" | "DISCOUNT_OFFER" | "NEWSLETTER" | "CUSTOM";
    }
    
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }
    
    const templates = await prisma.emailTemplate.findMany({
      where,
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
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return NextResponse.json({ templates });
  } catch (error: unknown) {
    console.error("Error fetching email templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    
    const body = await request.json();
    const validatedData = emailTemplateSchema.parse(body);
    
    // Check if template name already exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { name: validatedData.name }
    });
    
    if (existingTemplate) {
      return NextResponse.json(
        { error: "Template name already exists" },
        { status: 400 }
      );
    }
    
    const template = await prisma.emailTemplate.create({
      data: {
        name: validatedData.name,
        subject: validatedData.subject,
        content: validatedData.content,
        variables: validatedData.variables,
        category: validatedData.category,
        isActive: validatedData.isActive,
        createdBy: user.id
      },
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
    
    return NextResponse.json({ template }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating email template:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create email template" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { id, isActive } = body;
    
    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: "Template ID and isActive status are required" },
        { status: 400 }
      );
    }
    
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: { isActive },
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
    
    return NextResponse.json({ template });
  } catch (error: unknown) {
    console.error("Error toggling email template:", error);
    return NextResponse.json(
      { error: "Failed to toggle email template" },
      { status: 500 }
    );
  }
} 