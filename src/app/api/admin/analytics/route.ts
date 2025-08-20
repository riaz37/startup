import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get overview metrics
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      activeUsers,
      newUsers,
      completedOrders,
      pendingOrders,
      cancelledOrders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { total: true }
      }),
      prisma.user.count({
        where: {
          lastLoginAt: { gte: startDate }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.order.count({
        where: {
          status: "DELIVERED",
          createdAt: { gte: startDate }
        }
      }),
      prisma.order.count({
        where: {
          status: "PENDING",
          createdAt: { gte: startDate }
        }
      }),
      prisma.order.count({
        where: {
          status: "CANCELLED",
          createdAt: { gte: startDate }
        }
      })
    ]);

    // Get trend data with sorting
    const getTrendData = async (
      model: any, 
      dateField: string, 
      valueField: string, 
      whereClause: Record<string, unknown>
    ) => {
      const groupByOptions: Record<string, unknown> = {
        by: [dateField],
        where: whereClause,
        _count: true,
        orderBy: {
          [dateField]: sortOrder === 'desc' ? 'desc' : 'asc'
        }
      };

      // Only add _sum if we need it for revenue calculations
      if (valueField === 'total') {
        groupByOptions._sum = { total: true };
      }

      const data = await model.groupBy(groupByOptions);

      return data.map((item: Record<string, unknown>) => {
        let value = 0;
        
        if (valueField === 'total' && (item._sum as any)?.total) {
          value = (item._sum as any).total;
        } else if (valueField === 'count') {
          value = (item._count as number) || 0;
        } else {
          value = (item._count as number) || 0;
        }

        return {
          date: (item[dateField] as Date).toISOString().split('T')[0],
          [valueField]: value
        };
      });
    };

    const [userTrends, orderTrends, revenueTrends] =
    
    await Promise.all([
      getTrendData(prisma.user, 'createdAt', 'count', { createdAt: { gte: startDate } }),
      getTrendData(prisma.order, 'createdAt', 'count', { createdAt: { gte: startDate } }),
      getTrendData(prisma.order, 'createdAt', 'total', { 
        status: "DELIVERED", 
        createdAt: { gte: startDate } 
      })
    ]);

    // Get user behavior data with advanced filtering
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: "DELIVERED",
          createdAt: { gte: startDate }
        }
      },
      _count: {
        quantity: true
      },
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: sortBy === 'revenue' 
        ? { _sum: { price: sortOrder === 'desc' ? 'desc' : 'asc' } }
        : sortBy === 'orders'
        ? { _count: { quantity: sortOrder === 'desc' ? 'desc' : 'asc' } }
        : { _sum: { quantity: sortOrder === 'desc' ? 'desc' : 'asc' } },
      take: 20
    });

    // Get conversion funnel data from analytics events
    const getConversionData = async () => {
      const [pageViews, productViews, addToCart, checkoutStarted, ordersCompleted] = await Promise.all([
        prisma.analyticsEvent.count({
          where: {
            eventType: "PRODUCT_VIEWED",
            createdAt: { gte: startDate }
          }
        }),
        prisma.analyticsEvent.count({
          where: {
            eventType: "PRODUCT_VIEWED",
            createdAt: { gte: startDate }
          }
        }),
        prisma.analyticsEvent.count({
          where: {
            eventType: "CART_ITEM_ADDED",
            createdAt: { gte: startDate }
          }
        }),
        prisma.analyticsEvent.count({
          where: {
            eventType: "ORDER_PLACED",
            createdAt: { gte: startDate }
          }
        }),
        prisma.order.count({
          where: {
            status: "DELIVERED",
            createdAt: { gte: startDate }
          }
        })
      ]);

      return [
        { stage: "Page Views", count: pageViews, conversion: 100 },
        { stage: "Product Views", count: productViews, conversion: productViews > 0 ? (productViews / pageViews) * 100 : 0 },
        { stage: "Add to Cart", count: addToCart, conversion: addToCart > 0 ? (addToCart / productViews) * 100 : 0 },
        { stage: "Checkout Started", count: checkoutStarted, conversion: checkoutStarted > 0 ? (checkoutStarted / addToCart) * 100 : 0 },
        { stage: "Orders Completed", count: ordersCompleted, conversion: ordersCompleted > 0 ? (ordersCompleted / checkoutStarted) * 100 : 0 }
      ];
    };

    const conversionFunnel = await getConversionData();

    // Get additional insights
    // @ts-expect-error - Prisma circular reference types
    const userSegments = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
      orderBy: {
        _count: { id: 'desc' }
      }
    });

    // @ts-expect-error - Prisma circular reference types
    const deviceUsage = await prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      where: {
        createdAt: { gte: startDate }
      },
      _count: true,
      orderBy: {
        _count: { id: 'desc' }
      }
    });

    // Calculate advanced metrics
    const conversionRate = totalUsers > 0 ? (completedOrders / totalUsers) * 100 : 0;
    const averageOrderValue = totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0;
    const orderCompletionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const userRetentionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    const response = {
      overview: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue),
        activeUsers,
        newUsers,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        orderCompletionRate: Math.round(orderCompletionRate * 100) / 100,
        userRetentionRate: Math.round(userRetentionRate * 100) / 100
      },
      trends: {
        users: userTrends,
        orders: orderTrends,
        revenue: revenueTrends
      },
      userBehavior: {
        topProducts: topProducts.map(item => ({
          productId: item.productId,
          orders: item._count.quantity,
          quantity: item._sum.quantity,
          revenue: item._sum.price
        })),
        userSegments: userSegments.map(segment => ({
          role: segment.role,
          count: segment._count,
          percentage: (segment._count / totalUsers) * 100
        })),
        deviceUsage: deviceUsage.map(device => ({
          device: device.eventType,
          count: device._count,
          percentage: (device._count / (deviceUsage.reduce((sum, d) => sum + d._count, 0))) * 100
        }))
      },
      conversion: {
        funnel: conversionFunnel
      },
      metadata: {
        timeRange,
        sortBy,
        sortOrder,
        generatedAt: new Date().toISOString(),
        dataPoints: {
          users: userTrends.length,
          orders: orderTrends.length,
          revenue: revenueTrends.length
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 