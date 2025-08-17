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

    // Build where clause
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
    const currentSales = await prisma.order.aggregate({
      where: whereClause,
      _sum: {
        totalAmount: true,
        quantity: true
      },
      _count: true
    });

    // Fetch previous period data
    const previousWhereClause = {
      ...whereClause,
      createdAt: { gte: previousStart, lte: previousEnd }
    };

    const previousSales = await prisma.order.aggregate({
      where: previousWhereClause,
      _sum: {
        totalAmount: true,
        quantity: true
      },
      _count: true
    });

    // Calculate growth percentages
    const salesGrowth = previousSales._sum.totalAmount && previousSales._sum.totalAmount > 0
      ? ((currentSales._sum.totalAmount! - previousSales._sum.totalAmount) / previousSales._sum.totalAmount) * 100
      : 0;

    // Get top products by revenue
    const topProducts = await prisma.order.groupBy({
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
      take: 10
    });

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (product) => {
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
          totalSold: product._sum.quantity || 0,
          revenue: product._sum.totalAmount || 0,
          category: productDetails?.category?.name || "Uncategorized"
        };
      })
    );

    // Get sales by category
    const salesByCategory = await prisma.order.groupBy({
      by: ["productId"],
      where: whereClause,
      _sum: {
        totalAmount: true
      }
    });

    const categorySales = await Promise.all(
      salesByCategory.map(async (sale) => {
        const product = await prisma.product.findUnique({
          where: { id: sale.productId },
          select: {
            category: {
              select: { name: true }
            }
          }
        });
        return {
          category: product?.category?.name || "Uncategorized",
          revenue: sale._sum.totalAmount || 0
        };
      })
    );

    // Aggregate by category
    const categoryRevenue = categorySales.reduce((acc, sale) => {
      const existing = acc.find(c => c.category === sale.category);
      if (existing) {
        existing.revenue += sale.revenue;
      } else {
        acc.push({ category: sale.category, revenue: sale.revenue });
      }
      return acc;
    }, [] as { category: string; revenue: number }[]);

    // Calculate total revenue for percentage calculation
    const totalRevenue = currentSales._sum.totalAmount || 0;
    const categoryRevenueWithPercentage = categoryRevenue.map(cat => ({
      ...cat,
      percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0
    }));

    const salesMetrics = {
      totalSales: currentSales._sum.totalAmount || 0,
      totalOrders: currentSales._count,
      averageOrderValue: currentSales._count > 0 ? (currentSales._sum.totalAmount || 0) / currentSales._count : 0,
      salesGrowth,
      topProducts: topProductsWithDetails,
      categoryBreakdown: categoryRevenueWithPercentage
    };

    return NextResponse.json(salesMetrics);
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales data" },
      { status: 500 }
    );
  }
} 