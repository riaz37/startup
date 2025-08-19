import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib";
import { prisma } from "@/lib/database";
import { z } from "zod";

const createDiscountSchema = z.object({
  name: z.string().min(1, "Discount name is required"),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().positive("Discount value must be positive"),
  minQuantity: z.number().positive().optional(),
  maxQuantity: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const updateDiscountSchema = createDiscountSchema.partial();

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const discountType = searchParams.get("discountType");
    
    const where: any = {};
    
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }
    
    if (discountType) {
      where.discountType = discountType;
    }
    
    const discounts = await prisma.discountConfig.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return NextResponse.json(discounts);
  } catch (error: any) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const validatedData = createDiscountSchema.parse(body);
    
    // Check if discount name already exists
    const existingDiscount = await prisma.discountConfig.findFirst({
      where: { name: validatedData.name }
    });
    
    if (existingDiscount) {
      return NextResponse.json(
        { error: "Discount name already exists" },
        { status: 400 }
      );
    }
    
    // Parse dates if provided
    let startDate = undefined;
    let endDate = undefined;
    
    if (validatedData.startDate) {
      startDate = new Date(validatedData.startDate);
    }
    
    if (validatedData.endDate) {
      endDate = new Date(validatedData.endDate);
    }
    
    // Validate date range
    if (startDate && endDate && startDate >= endDate) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }
    
    const discount = await prisma.discountConfig.create({
      data: {
        ...validatedData,
        startDate,
        endDate,
        isActive: true
      }
    });
    
    return NextResponse.json(discount, { status: 201 });
  } catch (error: any) {
    console.error("Error creating discount:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create discount" },
      { status: 500 }
    );
  }
} 