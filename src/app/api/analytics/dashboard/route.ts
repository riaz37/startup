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

    // Parse dates or use defaults
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Get previous period for comparison
    const periodLength = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = new Date(start.getTime());

    // Fetch current period data
    const [
      currentOrders,
      currentUsers,
      currentProducts,
      currentGroupOrders,
      currentRevenue,
      previousOrders,
      previousUsers,
      previousRevenue
    ] = await Promise.all([
      // Current period orders
      prisma.order.count({
        where: {
          createdAt: { gte: start, lte: end }
        }
      }),
      // Current period users
      prisma.user.count({
        where: {
          createdAt: { gte: start, lte: end }
        }
      }),
      // Current period products
      prisma.product.count({
        where: {
          createdAt: { gte: start, lte: end }
        }
      }),
      // Current period group orders
      prisma.groupOrder.count({
        where: {
          createdAt: { gte: start, lte: end }
        }
      }),
      // Current period revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          status: { in: ["completed", "delivered"] }
        },
        _sum: {
          totalAmount: true
        }
      }),
      // Previous period orders
      prisma.order.count({
        where: {
          createdAt: { gte: previousStart, lte: previousEnd }
        }
      }),
      // Previous period users
      prisma.user.count({
        where: {
          createdAt: { gte: previousStart, lte: previousEnd }
        }
      }),
      // Previous period revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: previousStart, lte: previousEnd },
          status: { in: ["completed", "delivered"] }
        },
        _sum: {
          totalAmount: true
        }
      })
    ]);

    // Calculate growth percentages
    const orderGrowth = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;
    const userGrowth = previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0;
    const revenueGrowth = previousRevenue._sum.totalAmount && previousRevenue._sum.totalAmount > 0 
      ? ((currentRevenue._sum.totalAmount! - previousRevenue._sum.totalAmount) / previousRevenue._sum.totalAmount) * 100 
      : 0;

    // Get top products by revenue
    const topProducts = await prisma.order.groupBy({
      by: ["productId"],
      where: {
        createdAt: { gte: start, lte: end },
        status: { in: ["completed", "delivered"] }
      },
      _sum: {
        totalAmount: true,
        quantity: true
      },
      orderBy: {
        _sum: {
          totalAmount: "desc"
        }
      },
      take: 5
    });

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (product) => {
        const productDetails = await prisma.product.findUnique({
          where: { id: product.productId },
          select: { name: true }
        });
        return {
          productId: product.productId,
          productName: productDetails?.name || "Unknown Product",
          totalSold: product._sum.quantity || 0,
          revenue: product._sum.totalAmount || 0
        };
      })
    );

    // Get order status counts
    const orderStatusCounts = await prisma.order.groupBy({
      by: ["status"],
      where: {
        createdAt: { gte: start, lte: end }
      },
      _count: true
    });

    const orderMetrics = {
      totalOrders: currentOrders,
      pendingOrders: orderStatusCounts.find(s => s.status === "pending")?._count || 0,
      completedOrders: orderStatusCounts.find(s => s.status === "completed")?._count || 0,
      cancelledOrders: orderStatusCounts.find(s => s.status === "cancelled")?._count || 0,
      orderGrowth,
      averageOrderValue: currentOrders > 0 ? (currentRevenue._sum.totalAmount || 0) / currentOrders : 0
    };

    // Get group order metrics
    const groupOrderStatusCounts = await prisma.groupOrder.groupBy({
      by: ["status"],
      where: {
        createdAt: { gte: start, lte: end }
      },
      _count: true
    });

    const activeGroupOrders = groupOrderStatusCounts.find(s => s.status === "collecting")?._count || 0;
    const completedGroupOrders = groupOrderStatusCounts.find(s => s.status === "delivered")?._count || 0;

    // Calculate average participants for group orders
    const groupOrderParticipants = await prisma.groupOrder.aggregate({
      where: {
        createdAt: { gte: start, lte: end }
      },
      _avg: {
        currentQuantity: true
      }
    });

    const groupOrderMetrics = {
      totalGroupOrders: currentGroupOrders,
      activeGroupOrders,
      completedGroupOrders,
      averageParticipants: Math.round(groupOrderParticipants._avg.currentQuantity || 0),
      successRate: currentGroupOrders > 0 ? (completedGroupOrders / currentGroupOrders) * 100 : 0
    };

    // Get user metrics
    const userMetrics = {
      totalUsers: await prisma.user.count(),
      activeUsers: await prisma.user.count({
        where: {
          lastLoginAt: { gte: start }
        }
      }),
      newUsers: currentUsers,
      userGrowth
    };

    // Get sales metrics
    const salesMetrics = {
      totalSales: currentRevenue._sum.totalAmount || 0,
      totalOrders: currentOrders,
      averageOrderValue: orderMetrics.averageOrderValue,
      salesGrowth: revenueGrowth,
      topProducts: topProductsWithDetails
    };

    // Get revenue metrics
    const revenueMetrics = {
      totalRevenue: currentRevenue._sum.totalAmount || 0,
      monthlyRevenue: currentRevenue._sum.totalAmount || 0,
      revenueGrowth,
      revenueByCategory: [] // TODO: Implement category-based revenue breakdown
    };

    const dashboardAnalytics = {
      sales: salesMetrics,
      users: userMetrics,
      orders: orderMetrics,
      groupOrders: groupOrderMetrics,
      revenue: revenueMetrics
    };

    return NextResponse.json(dashboardAnalytics);
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
} 