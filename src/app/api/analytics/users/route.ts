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
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get previous period for comparison
    const periodLength = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = new Date(start.getTime());

    // Fetch current period data
    const [
      currentUsers,
      currentActiveUsers,
      previousUsers,
      previousActiveUsers,
      totalUsers,
      verifiedUsers,
      unverifiedUsers
    ] = await Promise.all([
      // Current period new users
      prisma.user.count({
        where: {
          createdAt: { gte: start, lte: end }
        }
      }),
      // Current period active users (users who logged in)
      prisma.user.count({
        where: {
          lastLoginAt: { gte: start, lte: end }
        }
      }),
      // Previous period new users
      prisma.user.count({
        where: {
          createdAt: { gte: previousStart, lte: previousEnd }
        }
      }),
      // Previous period active users
      prisma.user.count({
        where: {
          lastLoginAt: { gte: previousStart, lte: previousEnd }
        }
      }),
      // Total users
      prisma.user.count(),
      // Verified users
      prisma.user.count({
        where: {
          isVerified: true
        }
      }),
      // Unverified users
      prisma.user.count({
        where: {
          isVerified: false
        }
      })
    ]);

    // Calculate growth percentages
    const userGrowth = previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0;
    const activeUserGrowth = previousActiveUsers > 0 ? ((currentActiveUsers - previousActiveUsers) / previousActiveUsers) * 100 : 0;

    // Get top users by order count and spending
    const topUsers = await prisma.user.findMany({
      where: {
        orders: {
          some: {
            createdAt: { gte: start, lte: end }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        orders: {
          where: {
            createdAt: { gte: start, lte: end },
            status: { in: ["completed", "delivered"] }
          },
          select: {
            totalAmount: true
          }
        }
      },
      orderBy: {
        orders: {
          _count: "desc"
        }
      },
      take: 10
    });

    // Process top users data
    const topUsersProcessed = topUsers.map(user => ({
      userId: user.id,
      userName: user.name || user.email || "Unknown User",
      totalOrders: user.orders.length,
      totalSpent: user.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    }));

    // Get user registration trends (daily for the period)
    const userRegistrationTrends = await prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: start, lte: end }
      },
      _count: true,
      orderBy: {
        createdAt: "asc"
      }
    });

    // Get user activity by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: true
    });

    const userMetrics = {
      totalUsers,
      activeUsers: currentActiveUsers,
      newUsers: currentUsers,
      userGrowth,
      verifiedUsers,
      unverifiedUsers,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
      activeUserGrowth,
      topUsers: topUsersProcessed,
      userRegistrationTrends: userRegistrationTrends.map(trend => ({
        date: trend.createdAt.toISOString().split('T')[0],
        count: trend._count
      })),
      usersByRole: usersByRole.map(role => ({
        role: role.role,
        count: role._count
      }))
    };

    return NextResponse.json(userMetrics);
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
} 