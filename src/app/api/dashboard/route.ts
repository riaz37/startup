import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all dashboard data in parallel
    const [
      totalOrders,
      groupOrdersJoined,
      totalProducts,
      totalSavings,
      recentOrders,
      recentGroupOrders,
      userStats
    ] = await Promise.all([
      // Total orders count
      prisma.order.count({
        where: { userId }
      }),
      
      // Group orders joined count (unique group orders from user's orders)
      prisma.order.groupBy({
        by: ['groupOrderId'],
        where: { userId },
        _count: { groupOrderId: true }
      }).then(result => result.length),
      
      // Total products ordered
      prisma.orderItem.aggregate({
        where: { order: { userId } },
        _sum: { quantity: true }
      }),
      
      // Calculate total savings (sum of all order amounts)
      prisma.order.aggregate({
        where: { userId },
        _sum: { totalAmount: true }
      }),
      
      // Recent orders
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { category: true }
              }
            }
          },
          groupOrder: {
            include: {
              product: { include: { category: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Recent group order activities (from user's orders)
      prisma.order.findMany({
        where: { 
          userId,
          groupOrderId: { not: null } // Only include orders with group orders
        },
        include: {
          groupOrder: {
            include: {
              product: { include: { category: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // User statistics
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          createdAt: true,
          lastLoginAt: true,
          orders: {
            select: { id: true }
          }
        }
      })
    ]);

    // Calculate total savings
    const totalSavingsAmount = totalSavings._sum.totalAmount || 0;
    
    // Calculate products count
    const productsCount = totalProducts._sum.quantity || 0;

    return NextResponse.json({
      totalOrders,
      groupOrdersJoined,
      totalProducts: productsCount,
      totalSavings: totalSavingsAmount,
      recentOrders,
      recentGroupOrders,
      userStats
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
} 