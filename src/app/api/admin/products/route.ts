import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib";
import { prisma } from "@/lib/database";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";

const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  unitSize: z.number().positive("Unit size must be positive"),
  mrp: z.number().positive("MRP must be positive"),
  sellingPrice: z.number().positive("Selling price must be positive"),
  minOrderQty: z.number().positive("Minimum order quantity must be positive"),
  maxOrderQty: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");
    
    const where: Prisma.ProductWhereInput = {};
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);
    
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId }
    });
    
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }
    
    // Validate selling price vs MRP
    if (validatedData.sellingPrice > validatedData.mrp) {
      return NextResponse.json(
        { error: "Selling price cannot be higher than MRP" },
        { status: 400 }
      );
    }
    
    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        categoryId: validatedData.categoryId,
        unit: validatedData.unit,
        unitSize: validatedData.unitSize,
        mrp: validatedData.mrp,
        sellingPrice: validatedData.sellingPrice,
        minOrderQty: validatedData.minOrderQty,
        maxOrderQty: validatedData.maxOrderQty,
        imageUrl: validatedData.imageUrl,
        slug,
        isActive: true
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
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
} 