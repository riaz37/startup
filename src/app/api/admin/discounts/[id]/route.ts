import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib";
import { prisma } from "@/lib/database";
import { z } from "zod";

const updateDiscountSchema = z.object({
  name: z.string().min(1, "Discount name is required").optional(),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).optional(),
  discountValue: z.number().positive("Discount value must be positive").optional(),
  minQuantity: z.number().positive().optional(),
  maxQuantity: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    
    const discount = await prisma.discountConfig.findUnique({
      where: { id }
    });
    
    if (!discount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(discount);
  } catch (error) {
    console.error("Error fetching discount:", error);
    return NextResponse.json(
      { error: "Failed to fetch discount" },
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
    const validatedData = updateDiscountSchema.parse(body);
    
    // Check if discount exists
    const existingDiscount = await prisma.discountConfig.findUnique({
      where: { id }
    });
    
    if (!existingDiscount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }
    
    // If name is being updated, check for uniqueness
    if (validatedData.name && validatedData.name !== existingDiscount.name) {
      const nameExists = await prisma.discountConfig.findFirst({
        where: { name: validatedData.name }
      });
      
      if (nameExists) {
        return NextResponse.json(
          { error: "Discount name already exists" },
          { status: 400 }
        );
      }
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
    
    const updatedDiscount = await prisma.discountConfig.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        discountType: validatedData.discountType,
        discountValue: validatedData.discountValue,
        minQuantity: validatedData.minQuantity,
        maxQuantity: validatedData.maxQuantity,
        isActive: validatedData.isActive,
        startDate,
        endDate,
      }
    });
    
    return NextResponse.json(updatedDiscount);
  } catch (error) {
    console.error("Error updating discount:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update discount" },
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
    
    // Check if discount exists
    const existingDiscount = await prisma.discountConfig.findUnique({
      where: { id }
    });
    
    if (!existingDiscount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }
    
    await prisma.discountConfig.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Discount deleted successfully" });
  } catch (error) {
    console.error("Error deleting discount:", error);
    return NextResponse.json(
      { error: "Failed to delete discount" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const body = await request.json();
    
    // Handle toggle status
    if (body.action === 'toggle') {
      const discount = await prisma.discountConfig.findUnique({
        where: { id }
      });
      
      if (!discount) {
        return NextResponse.json(
          { error: "Discount not found" },
          { status: 404 }
        );
      }
      
      const updatedDiscount = await prisma.discountConfig.update({
        where: { id },
        data: { isActive: !discount.isActive }
      });
      
      return NextResponse.json(updatedDiscount);
    }
    
    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating discount:", error);
    return NextResponse.json(
      { error: "Failed to update discount" },
      { status: 500 }
    );
  }
} 