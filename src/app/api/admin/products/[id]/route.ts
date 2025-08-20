import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib";
import { prisma } from "@/lib/database";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  categoryId: z.string().min(1, "Category is required").optional(),
  unit: z.string().min(1, "Unit is required").optional(),
  unitSize: z.string().min(1, "Unit size is required").optional(),
  mrp: z.number().positive("MRP must be positive").optional(),
  sellingPrice: z.number().positive("Selling price must be positive").optional(),
  minOrderQty: z.number().positive("Minimum order quantity must be positive").optional(),
  maxOrderQty: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id }
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    // If category is being updated, check if it exists
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId }
      });
      
      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 400 }
        );
      }
    }
    
    // Validate selling price vs MRP if both are provided
    if (validatedData.sellingPrice !== undefined && validatedData.mrp !== undefined) {
      if (validatedData.sellingPrice > validatedData.mrp) {
        return NextResponse.json(
          { error: "Selling price cannot be higher than MRP" },
          { status: 400 }
        );
      }
    } else if (validatedData.sellingPrice !== undefined) {
      // Only selling price is being updated
      if (validatedData.sellingPrice > existingProduct.mrp) {
        return NextResponse.json(
          { error: "Selling price cannot be higher than MRP" },
          { status: 400 }
        );
      }
    } else if (validatedData.mrp !== undefined) {
      // Only MRP is being updated
      if (existingProduct.sellingPrice > validatedData.mrp) {
        return NextResponse.json(
          { error: "MRP cannot be lower than current selling price" },
          { status: 400 }
        );
      }
    }
    
    // Generate new slug if name is being updated
    let slug = existingProduct.slug;
    if (validatedData.name && validatedData.name !== existingProduct.name) {
      slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        slug
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    
    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("Error updating product:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id }
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    // Check if product is being used in orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: params.id }
    });
    
    if (orderCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete product that has been ordered" },
        { status: 400 }
      );
    }
    
    await prisma.product.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
} 