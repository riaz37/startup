import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
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
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate average rating
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