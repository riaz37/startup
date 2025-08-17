import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch product to verify it exists
    const product = await prisma.product.findUnique({
      where: { id: id },
      select: { id: true, name: true, isActive: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: "Product is not available" },
        { status: 400 }
      );
    }

    // Fetch price history for the last 90 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const priceHistory = await prisma.productPriceHistory.findMany({
      where: {
        productId: id,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        mrp: true,
        sellingPrice: true,
        changeReason: true,
        createdAt: true
      }
    });

    // Convert Decimal values to numbers
    const formattedHistory = priceHistory.map(record => ({
      ...record,
      mrp: Number(record.mrp),
      sellingPrice: Number(record.sellingPrice)
    }));

    return NextResponse.json({
      success: true,
      data: {
        productId: id,
        productName: product.name,
        priceHistory: formattedHistory,
        totalChanges: formattedHistory.length
      }
    });

  } catch (error) {
    console.error("Error fetching product price history:", error);
    return NextResponse.json(
      { error: "Failed to fetch price history" },
      { status: 500 }
    );
  }
} 