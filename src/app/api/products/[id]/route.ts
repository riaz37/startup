import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    
    const product = await prisma.product.findUnique({
      where: {
        id: id,
        ...(isAdmin ? {} : { isActive: true })
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        ...(isAdmin ? {} : {
          reviews: {
            include: {
              user: {
                select: {
                  name: true
                }
              }
            },
            orderBy: {
              createdAt: "desc"
            },
            take: 10
          }
        })
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (isAdmin) {
      return NextResponse.json({ product });
    }

    // Calculate average rating for public requests
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    return NextResponse.json({
      ...product,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.categoryId || !body.unit || !body.unitSize) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || '',
        categoryId: body.categoryId,
        unit: body.unit,
        unitSize: body.unitSize,
        mrp: body.mrp || 0,
        costPrice: body.costPrice || 0,
        sellingPrice: body.sellingPrice || 0,
        minOrderQty: body.minOrderQty || 1,
        maxOrderQty: body.maxOrderQty || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        imageUrl: body.imageUrl || null,
        updatedAt: new Date()
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: "Product updated successfully",
      product: updatedProduct 
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete the product
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ 
      message: "Product deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}