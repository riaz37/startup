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
    const category = searchParams.get("category");

    // Parse dates or use defaults
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get previous period for comparison
    const periodLength = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = new Date(start.getTime());

    // Build where clause for completed orders
    const whereClause: any = {
      createdAt: { gte: start, lte: end },
      status: { in: ["completed", "delivered"] }
    };

    if (category) {
      whereClause.product = {
        category: {
          name: category
        }
      };
    }

    // Fetch current period data
    const [
      currentRevenue,
      previousRevenue,
      revenueByCategory,
      revenueByMonth,
      revenueByProduct,
      paymentMethodRevenue
    ] = await Promise.all([
      // Current period revenue
      prisma.order.aggregate({
        where: whereClause,
        _sum: {
          totalAmount: true
        },
        _count: true
      }),
      // Previous period revenue
      prisma.order.aggregate({
        where: {
          ...whereClause,
          createdAt: { gte: previousStart, lte: previousEnd }
        },
        _sum: {
          totalAmount: true
        },
        _count: true
      }),
      // Revenue by category
      prisma.order.groupBy({
        by: ["productId"],
        where: whereClause,
        _sum: {
          totalAmount: true
        }
      }),
      // Revenue by month (for the current year)
      prisma.order.groupBy({
        by: ["createdAt"],
        where: {
          ...whereClause,
          createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) }
        },
        _sum: {
          totalAmount: true
        }
      }),
      // Revenue by product
      prisma.order.groupBy({
        by: ["productId"],
        where: whereClause,
        _sum: {
          totalAmount: true,
          quantity: true
        },
        orderBy: {
          _sum: {
            totalAmount: "desc"
          }
        },
        take: 20
      }),
      // Revenue by payment method
      prisma.order.groupBy({
        by: ["paymentMethod"],
        where: whereClause,
        _sum: {
          totalAmount: true
        },
        _count: true
      })
    ]);

    // Calculate growth percentages
    const revenueGrowth = previousRevenue._sum.totalAmount && previousRevenue._sum.totalAmount > 0
      ? ((currentRevenue._sum.totalAmount! - previousRevenue._sum.totalAmount) / previousRevenue._sum.totalAmount) * 100
      : 0;

    // Process revenue by category
    const categoryRevenue = await Promise.all(
      revenueByCategory.map(async (revenue) => {
        const product = await prisma.product.findUnique({
          where: { id: revenue.productId },
          select: {
            category: {
              select: { name: true }
            }
          }
        });
        return {
          category: product?.category?.name || "Uncategorized",
          revenue: revenue._sum.totalAmount || 0
        };
      })
    );

    // Aggregate category revenue
    const categoryRevenueAggregated = categoryRevenue.reduce((acc, item) => {
      const existing = acc.find(c => c.category === item.category);
      if (existing) {
        existing.revenue += item.revenue;
      } else {
        acc.push({ category: item.category, revenue: item.revenue });
      }
      return acc;
    }, [] as { category: string; revenue: number }[]);

    // Calculate total revenue for percentage calculation
    const totalRevenue = currentRevenue._sum.totalAmount || 0;
    const categoryRevenueWithPercentage = categoryRevenueAggregated
      .map(cat => ({
        ...cat,
        percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Process revenue by month
    const monthlyRevenue = revenueByMonth.reduce((acc, month) => {
      const monthKey = month.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      acc[monthKey] = (acc[monthKey] || 0) + (month._sum.totalAmount || 0);
      return acc;
    }, {} as Record<string, number>);

    // Process revenue by product
    const productRevenue = await Promise.all(
      revenueByProduct.map(async (product) => {
        const productDetails = await prisma.product.findUnique({
          where: { id: product.productId },
          select: {
            name: true,
            category: {
              select: { name: true }
            }
          }
        });
        return {
          productId: product.productId,
          productName: productDetails?.name || "Unknown Product",
          category: productDetails?.category?.name || "Uncategorized",
          revenue: product._sum.totalAmount || 0,
          quantity: product._sum.quantity || 0,
          averagePrice: product._sum.quantity && product._sum.quantity > 0
            ? (product._sum.totalAmount || 0) / product._sum.quantity
            : 0
        };
      })
    );

    // Process payment method revenue
    const paymentMethodRevenueProcessed = paymentMethodRevenue.map(method => ({
      method: method.paymentMethod || "Unknown",
      revenue: method._sum.totalAmount || 0,
      orderCount: method._count,
      percentage: totalRevenue > 0 ? ((method._sum.totalAmount || 0) / totalRevenue) * 100 : 0
    }));

    const revenueMetrics = {
      totalRevenue,
      monthlyRevenue: totalRevenue,
      revenueGrowth,
      revenueByCategory: categoryRevenueWithPercentage,
      revenueByMonth: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue
      })),
      revenueByProduct: productRevenue,
      revenueByPaymentMethod: paymentMethodRevenueProcessed,
      averageOrderValue: currentRevenue._count > 0 ? totalRevenue / currentRevenue._count : 0,
      totalOrders: currentRevenue._count
    };

    return NextResponse.json(revenueMetrics);
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    );
  }
} 