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

    // Get current date and 30 days ago for comparison
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Fetch all required data in parallel
    const [
      totalUsers,
      newUsers,
      previousPeriodUsers,
      totalOrders,
      activeOrders,
      completedOrders,
      previousPeriodOrders,
      totalRevenue,
      previousPeriodRevenue,
      totalGroupOrders,
      activeGroupOrders,
      completedGroupOrders,
      previousPeriodGroupOrders,
      totalProducts,
      newProducts,
      previousPeriodProducts
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      // New users in last 30 days
      prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      // Users in previous 30 days
      prisma.user.count({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      }),
      // Total orders
      prisma.order.count(),
      // Active orders (pending, processing)
      prisma.order.count({
        where: {
          status: { in: ["PENDING", "PROCESSING"] }
        }
      }),
      // Completed orders
      prisma.order.count({
        where: {
          status: { in: ["DELIVERED"] }
        }
      }),
      // Orders in previous 30 days
      prisma.order.count({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      }),
      // Total revenue
      prisma.order.aggregate({
        where: {
          status: { in: ["DELIVERED"] }
        },
        _sum: {
          totalAmount: true
        }
      }),
      // Revenue in previous 30 days
      prisma.order.aggregate({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          status: { in: ["DELIVERED"] }
        },
        _sum: {
          totalAmount: true
        }
      }),
      // Total group orders
      prisma.groupOrder.count(),
      // Active group orders
      prisma.groupOrder.count({
        where: {
          status: "COLLECTING"
        }
      }),
      // Completed group orders
      prisma.groupOrder.count({
        where: {
          status: { in: ["DELIVERED"] }
        }
      }),
      // Group orders in previous 30 days
      prisma.groupOrder.count({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      }),
      // Total products
      prisma.product.count(),
      // New products in last 30 days
      prisma.product.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      // Products in previous 30 days
      prisma.product.count({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
        }
      })
    ]);

    // Calculate growth percentages
    const userGrowth = previousPeriodUsers > 0 ? ((newUsers - previousPeriodUsers) / previousPeriodUsers) * 100 : 0;
    const orderGrowth = previousPeriodOrders > 0 ? ((activeOrders - previousPeriodOrders) / previousPeriodOrders) * 100 : 0;
    const revenueGrowth = previousPeriodRevenue._sum?.totalAmount && previousPeriodRevenue._sum.totalAmount > 0
      ? ((totalRevenue._sum?.totalAmount || 0) - previousPeriodRevenue._sum.totalAmount) / previousPeriodRevenue._sum.totalAmount * 100
      : 0;
    const groupOrderGrowth = previousPeriodGroupOrders > 0 ? ((totalGroupOrders - previousPeriodGroupOrders) / previousPeriodGroupOrders) * 100 : 0;
    const productGrowth = previousPeriodProducts > 0 ? ((newProducts - previousPeriodProducts) / previousPeriodProducts) * 100 : 0;

    // Get recent group orders for the dashboard
    const recentGroupOrders = await prisma.groupOrder.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // Get order status breakdown
    const orderStatusBreakdown = await prisma.order.groupBy({
      by: ["status"],
      _count: true
    });

    // Get user role breakdown
    const userRoleBreakdown = await prisma.user.groupBy({
      by: ["role"],
      _count: true
    });

    // Get top performing products
    const topProducts = await prisma.order.groupBy({
      by: ["groupOrderId"],
      where: {
        status: { in: ["DELIVERED"] },
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: {
        totalAmount: true
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
        // Get the group order to find the product
        const groupOrder = await prisma.groupOrder.findUnique({
          where: { id: product.groupOrderId },
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        });
        
        return {
          productId: groupOrder?.productId || "unknown",
          productName: groupOrder?.product?.name || "Unknown Product",
          category: groupOrder?.product?.category?.name || "Uncategorized",
          revenue: product._sum?.totalAmount || 0,
          quantity: 1 // Group orders have quantity 1
        };
      })
    );

    const adminStats = {
      users: {
        total: totalUsers,
        new: newUsers,
        growth: userGrowth,
        breakdown: userRoleBreakdown.map(role => ({
          role: role.role,
          count: role._count
        }))
      },
      orders: {
        total: totalOrders,
        active: activeOrders,
        completed: completedOrders,
        growth: orderGrowth,
        breakdown: orderStatusBreakdown.map(status => ({
          status: status.status,
          count: status._count
        }))
      },
      revenue: {
        total: totalRevenue._sum?.totalAmount || 0,
        growth: revenueGrowth,
        currency: "BDT"
      },
      groupOrders: {
        total: totalGroupOrders,
        active: activeGroupOrders,
        completed: completedGroupOrders,
        growth: groupOrderGrowth,
        recent: recentGroupOrders.map(go => ({
          id: go.id,
          productName: go.product.name,
          status: go.status,
          currentQuantity: go.currentQuantity,
          targetQuantity: go.targetQuantity,
          participantCount: go.orders.length,
          progressPercentage: go.targetQuantity > 0 
            ? Math.min((go.currentQuantity / go.targetQuantity) * 100, 100)
            : 0
        }))
      },
      products: {
        total: totalProducts,
        new: newProducts,
        growth: productGrowth,
        topPerforming: topProductsWithDetails
      }
    };

    return NextResponse.json(adminStats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
} 