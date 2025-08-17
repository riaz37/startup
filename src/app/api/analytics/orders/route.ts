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
      currentOrders,
      currentRevenue,
      previousOrders,
      previousRevenue,
      orderStatusCounts,
      ordersByProduct
    ] = await Promise.all([
      // Current period orders
      prisma.order.count({
        where: whereClause
      }),
      // Current period revenue
      prisma.order.aggregate({
        where: {
          ...whereClause,
          status: { in: ["completed", "delivered"] }
        },
        _sum: {
          totalAmount: true
        }
      }),
      // Previous period orders
      prisma.order.count({
        where: {
          ...whereClause,
          createdAt: { gte: previousStart, lte: previousEnd }
        }
      }),
      // Previous period revenue
      prisma.order.aggregate({
        where: {
          ...whereClause,
          createdAt: { gte: previousStart, lte: previousEnd },
          status: { in: ["completed", "delivered"] }
        },
        _sum: {
          totalAmount: true
        }
      }),
      // Order status counts
      prisma.order.groupBy({
        by: ["status"],
        where: whereClause,
        _count: true
      }),
      // Orders by product
      prisma.order.groupBy({
        by: ["productId"],
        where: whereClause,
        _count: true,
        _sum: {
          totalAmount: true,
          quantity: true
        }
      })
    ]);

    // Calculate growth percentages
    const orderGrowth = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;
    const revenueGrowth = previousRevenue._sum.totalAmount && previousRevenue._sum.totalAmount > 0
      ? ((currentRevenue._sum.totalAmount! - previousRevenue._sum.totalAmount) / previousRevenue._sum.totalAmount) * 100
      : 0;

    // Process order status counts
    const statusMetrics = {
      totalOrders: currentOrders,
      pendingOrders: orderStatusCounts.find(s => s.status === "pending")?._count || 0,
      processingOrders: orderStatusCounts.find(s => s.status === "processing")?._count || 0,
      completedOrders: orderStatusCounts.find(s => s.status === "completed")?._count || 0,
      deliveredOrders: orderStatusCounts.find(s => s.status === "delivered")?._count || 0,
      cancelledOrders: orderStatusCounts.find(s => s.status === "cancelled")?._count || 0,
      failedOrders: orderStatusCounts.find(s => s.status === "failed")?._count || 0
    };

    // Get product details for orders by product
    const ordersByProductWithDetails = await Promise.all(
      ordersByProduct.map(async (order) => {
        const product = await prisma.product.findUnique({
          where: { id: order.productId },
          select: {
            name: true,
            category: {
              select: { name: true }
            }
          }
        });
        return {
          productId: order.productId,
          productName: product?.name || "Unknown Product",
          category: product?.category?.name || "Uncategorized",
          orderCount: order._count,
          totalRevenue: order._sum.totalAmount || 0,
          totalQuantity: order._sum.quantity || 0,
          averageOrderValue: order._count > 0 ? (order._sum.totalAmount || 0) / order._count : 0
        };
      })
    );

    // Get order trends (daily for the period)
    const orderTrends = await prisma.order.groupBy({
      by: ["createdAt"],
      where: whereClause,
      _count: true,
      _sum: {
        totalAmount: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    // Get average order value by status
    const averageOrderValueByStatus = await prisma.order.groupBy({
      by: ["status"],
      where: whereClause,
      _avg: {
        totalAmount: true
      },
      _count: true
    });

    const orderMetrics = {
      totalOrders: currentOrders,
      pendingOrders: statusMetrics.pendingOrders,
      completedOrders: statusMetrics.completedOrders + statusMetrics.deliveredOrders,
      cancelledOrders: statusMetrics.cancelledOrders,
      orderGrowth,
      averageOrderValue: currentOrders > 0 ? (currentRevenue._sum.totalAmount || 0) / currentOrders : 0,
      totalRevenue: currentRevenue._sum.totalAmount || 0,
      revenueGrowth,
      ordersByProduct: ordersByProductWithDetails,
      orderTrends: orderTrends.map(trend => ({
        date: trend.createdAt.toISOString().split('T')[0],
        orderCount: trend._count,
        revenue: trend._sum.totalAmount || 0
      })),
      averageOrderValueByStatus: averageOrderValueByStatus.map(status => ({
        status: status.status,
        averageValue: status._avg.totalAmount || 0,
        orderCount: status._count
      })),
      statusBreakdown: statusMetrics
    };

    return NextResponse.json(orderMetrics);
  } catch (error) {
    console.error("Error fetching order analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch order data" },
      { status: 500 }
    );
  }
} 