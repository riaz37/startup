import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    // Fetch active group orders for the specific product
    const groupOrders = await prisma.groupOrder.findMany({
      where: {
        productId: productId,
        status: "COLLECTING", // Only show active collecting orders
        expiresAt: {
          gte: new Date() // Only show non-expired orders
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unit: true,
            unitSize: true,
            imageUrl: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            user: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Calculate progress and additional info for each group order
    const groupOrdersWithProgress = groupOrders.map(groupOrder => ({
      id: groupOrder.id,
      batchNumber: groupOrder.batchNumber,
      minThreshold: groupOrder.minThreshold,
      currentAmount: groupOrder.currentAmount,
      targetQuantity: groupOrder.targetQuantity,
      currentQuantity: groupOrder.currentQuantity,
      pricePerUnit: groupOrder.pricePerUnit,
      status: groupOrder.status,
      expiresAt: groupOrder.expiresAt.toISOString(),
      estimatedDelivery: groupOrder.estimatedDelivery?.toISOString() || null,
      createdAt: groupOrder.createdAt.toISOString(),
      updatedAt: groupOrder.updatedAt.toISOString(),
      progressPercentage: Math.min(
        (groupOrder.currentAmount / groupOrder.minThreshold) * 100,
        100
      ),
      participantCount: groupOrder._count.orders,
      timeRemaining: Math.max(
        0,
        Math.floor((groupOrder.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      ),
      product: groupOrder.product
    }));

    return NextResponse.json({
      groupOrders: groupOrdersWithProgress,
      count: groupOrdersWithProgress.length
    });
  } catch (error) {
    console.error("Error fetching group orders for product:", error);
    return NextResponse.json(
      { error: "Failed to fetch group orders for product" },
      { status: 500 }
    );
  }
} 