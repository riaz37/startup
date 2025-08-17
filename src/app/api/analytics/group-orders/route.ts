import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { Role } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    // Parse dates or use defaults
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get previous period for comparison
    const periodLength = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = new Date(start.getTime());

    // Build where clause
    const whereClause: any = {
      createdAt: { gte: start, lte: end }
    };

    if (status) {
      whereClause.status = status;
    }

    // Fetch current period data
    const [
      currentGroupOrders,
      currentActiveGroupOrders,
      currentCompletedGroupOrders,
      currentFailedGroupOrders,
      previousGroupOrders,
      previousActiveGroupOrders,
      previousCompletedGroupOrders,
      groupOrderStatusCounts,
      groupOrdersByProduct
    ] = await Promise.all([
      // Current period total group orders
      prisma.groupOrder.count({
        where: whereClause
      }),
      // Current period active group orders
      prisma.groupOrder.count({
        where: {
          ...whereClause,
          status: "collecting"
        }
      }),
      // Current period completed group orders
      prisma.groupOrder.count({
        where: {
          ...whereClause,
          status: { in: ["delivered", "completed"] }
        }
      }),
      // Current period failed group orders
      prisma.groupOrder.count({
        where: {
          ...whereClause,
          status: { in: ["cancelled", "failed"] }
        }
      }),
      // Previous period total group orders
      prisma.groupOrder.count({
        where: {
          ...whereClause,
          createdAt: { gte: previousStart, lte: previousEnd }
        }
      }),
      // Previous period active group orders
      prisma.groupOrder.count({
        where: {
          ...whereClause,
          createdAt: { gte: previousStart, lte: previousEnd },
          status: "collecting"
        }
      }),
      // Previous period completed group orders
      prisma.groupOrder.count({
        where: {
          ...whereClause,
          createdAt: { gte: previousStart, lte: previousEnd },
          status: { in: ["delivered", "completed"] }
        }
      }),
      // Group order status counts
      prisma.groupOrder.groupBy({
        by: ["status"],
        where: whereClause,
        _count: true
      }),
      // Group orders by product
      prisma.groupOrder.groupBy({
        by: ["productId"],
        where: whereClause,
        _count: true,
        _avg: {
          currentQuantity: true,
          targetQuantity: true,
          pricePerUnit: true
        }
      })
    ]);

    // Calculate growth percentages
    const groupOrderGrowth = previousGroupOrders > 0 ? ((currentGroupOrders - previousGroupOrders) / previousGroupOrders) * 100 : 0;
    const activeGroupOrderGrowth = previousActiveGroupOrders > 0 ? ((currentActiveGroupOrders - previousActiveGroupOrders) / previousActiveGroupOrders) * 100 : 0;
    const completedGroupOrderGrowth = previousCompletedGroupOrders > 0 ? ((currentCompletedGroupOrders - previousCompletedGroupOrders) / previousCompletedGroupOrders) * 100 : 0;

    // Calculate success rate
    const successRate = currentGroupOrders > 0 ? (currentCompletedGroupOrders / currentGroupOrders) * 100 : 0;

    // Get average participants and threshold achievement
    const averageMetrics = await prisma.groupOrder.aggregate({
      where: whereClause,
      _avg: {
        currentQuantity: true,
        targetQuantity: true,
        minThreshold: true,
        pricePerUnit: true
      }
    });

    // Get product details for group orders by product
    const groupOrdersByProductWithDetails = await Promise.all(
      groupOrdersByProduct.map(async (groupOrder) => {
        const product = await prisma.product.findUnique({
          where: { id: groupOrder.productId },
          select: {
            name: true,
            category: {
              select: { name: true }
            }
          }
        });
        return {
          productId: groupOrder.productId,
          productName: product?.name || "Unknown Product",
          category: product?.category?.name || "Uncategorized",
          groupOrderCount: groupOrder._count,
          averageCurrentQuantity: groupOrder._avg.currentQuantity || 0,
          averageTargetQuantity: groupOrder._avg.targetQuantity || 0,
          averagePricePerUnit: groupOrder._avg.pricePerUnit || 0,
          thresholdAchievementRate: groupOrder._avg.targetQuantity && groupOrder._avg.targetQuantity > 0
            ? ((groupOrder._avg.currentQuantity || 0) / groupOrder._avg.targetQuantity) * 100
            : 0
        };
      })
    );

    // Get group order trends (daily for the period)
    const groupOrderTrends = await prisma.groupOrder.groupBy({
      by: ["createdAt"],
      where: whereClause,
      _count: true,
      orderBy: {
        createdAt: "asc"
      }
    });

    // Get threshold achievement analysis
    const thresholdAnalysis = await prisma.groupOrder.groupBy({
      by: ["status"],
      where: whereClause,
      _avg: {
        currentQuantity: true,
        targetQuantity: true,
        minThreshold: true
      },
      _count: true
    });

    const groupOrderMetrics = {
      totalGroupOrders: currentGroupOrders,
      activeGroupOrders: currentActiveGroupOrders,
      completedGroupOrders: currentCompletedGroupOrders,
      failedGroupOrders: currentFailedGroupOrders,
      averageParticipants: Math.round(averageMetrics._avg.currentQuantity || 0),
      averageTargetQuantity: Math.round(averageMetrics._avg.targetQuantity || 0),
      averageMinThreshold: Math.round(averageMetrics._avg.minThreshold || 0),
      averagePricePerUnit: averageMetrics._avg.pricePerUnit || 0,
      successRate,
      groupOrderGrowth,
      activeGroupOrderGrowth,
      completedGroupOrderGrowth,
      groupOrdersByProduct: groupOrdersByProductWithDetails,
      groupOrderTrends: groupOrderTrends.map(trend => ({
        date: trend.createdAt.toISOString().split('T')[0],
        count: trend._count
      })),
      thresholdAnalysis: thresholdAnalysis.map(analysis => ({
        status: analysis.status,
        averageCurrentQuantity: analysis._avg.currentQuantity || 0,
        averageTargetQuantity: analysis._avg.targetQuantity || 0,
        averageMinThreshold: analysis._avg.minThreshold || 0,
        count: analysis._count
      })),
      statusBreakdown: groupOrderStatusCounts.map(status => ({
        status: status.status,
        count: status._count
      }))
    };

    return NextResponse.json(groupOrderMetrics);
  } catch (error) {
    console.error("Error fetching group order analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch group order data" },
      { status: 500 }
    );
  }
} 