import { getCurrentUser } from "@/lib";
import { redirect } from "next/navigation";
import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { 
  DashboardStats, 
  QuickActions, 
  UserProfileCard, 
  RecentActivity 
} from "@/components/dashboard";
import { PaymentHistory } from "@/components/payments/payment-history";
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  Settings,
  Heart,
  CreditCard,
  Calendar,
  MapPin,
  Star
} from "lucide-react";
import OrderHistoryWidget from "@/components/orders/order-history-widget";
import { prisma } from "@/lib/database";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch real dashboard data
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
      where: { userId: user.id }
    }),
    
    // Group orders joined count (unique group orders from user's orders)
    prisma.order.groupBy({
      by: ['groupOrderId'],
      where: { userId: user.id },
      _count: { groupOrderId: true }
    }).then(result => result.length),
    
    // Total products ordered
    prisma.orderItem.aggregate({
      where: { order: { userId: user.id } },
      _sum: { quantity: true }
    }),
    
    // Calculate total savings (sum of all order amounts)
    prisma.order.aggregate({
      where: { userId: user.id },
      _sum: { totalAmount: true }
    }),
    
    // Recent orders
    prisma.order.findMany({
      where: { userId: user.id },
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
      where: { userId: user.id },
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
      where: { id: user.id },
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
  
  // Calculate member since
  const memberSince = userStats?.createdAt ? 
    Math.floor((Date.now() - userStats.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Dashboard stats with real data
  const dashboardStats = [
    {
      icon: ShoppingCart,
      title: "Total Orders",
      value: totalOrders.toString(),
      change: `${recentOrders.length} this month`,
      trend: "up" as const,
      color: "primary" as const,
      description: "Your order history"
    },
    {
      icon: Users,
      title: "Group Orders",
      value: groupOrdersJoined.toString(),
      change: `${recentGroupOrders.length} recent`,
      trend: "up" as const,
      color: "secondary" as const,
      description: "Bulk orders joined"
    },
    {
      icon: Package,
      title: "Products",
      value: productsCount.toString(),
      change: "Items ordered",
      trend: "neutral" as const,
      color: "accent" as const,
      description: "Total items purchased"
    },
    {
      icon: TrendingUp,
      title: "Total Spent",
      value: `₹${totalSavingsAmount.toFixed(0)}`,
      change: "vs. retail price",
      trend: "up" as const,
      color: "success" as const,
      description: "Money invested"
    }
  ];

  // Quick actions
  const quickActions = [
    {
      icon: Users,
      title: "Browse Group Orders",
      description: "Join bulk orders & save money",
      href: "/group-orders",
      color: "primary" as const,
      badge: "Hot Deals"
    },
    {
      icon: Package,
      title: "Product Catalog",
      description: "Explore our fresh products",
      href: "/products",
      color: "secondary" as const,
      badge: "New"
    },
    {
      icon: ShoppingCart,
      title: "My Orders",
      description: "Track your order status",
      href: "/orders",
      color: "accent" as const,
      badge: "Active"
    },
    {
      icon: Heart,
      title: "Help Center",
      description: "Get support & answers",
      href: "/help",
      color: "secondary" as const,
      badge: "24/7"
    }
  ];

  // Add admin action if user is admin
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    quickActions.push({
      icon: Settings,
      title: "Admin Panel",
      description: "Manage platform & users",
      href: "/admin",
      color: "primary" as const,
      badge: "Admin"
    });
  }

  // Transform recent orders into activities
  const recentActivities = [
    ...recentOrders.map(order => ({
      id: order.id,
      type: "order" as const,
      title: `Order #${order.id.slice(-6)}`,
      description: `${order.items.length} items - ${order.status}`,
      timestamp: order.createdAt.toISOString(),
      status: order.status,
      href: `/orders/${order.id}`,
      amount: order.totalAmount
    })),
    ...recentGroupOrders.map(order => ({
      id: order.id,
      type: "group_order" as const,
      title: `Joined ${order.groupOrder.product.name}`,
      description: `Batch #${order.groupOrder.batchNumber} - ${order.groupOrder.status}`,
      timestamp: order.createdAt.toISOString(),
      status: order.groupOrder.status,
      href: `/group-orders/${order.groupOrder.id}`,
      progress: order.groupOrder.currentQuantity / order.groupOrder.targetQuantity
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
   .slice(0, 8);

  return (
    <PageLayout>
      <MainContainer>
        {/* Page Header */}
        <PageHeader
          badge="🏠 Dashboard"
          title={`Welcome back, ${user.name?.split(' ')[0] || 'User'}!`}
          highlightedWord={user.name?.split(' ')[0] || 'User'}
          description="Track your orders, monitor group buying progress, and manage your Sohozdaam account. Here&apos;s what&apos;s happening with your savings today."
        />

        {/* Welcome Stats Section */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 rounded-2xl p-8 mb-12 border border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Your Sohozdaam Journey
              </h2>
              <p className="text-muted-foreground">
                Member for {memberSince} days • {totalOrders} orders placed
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                ₹{totalSavingsAmount.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Investment</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-1">
                {groupOrdersJoined}
              </div>
              <div className="text-sm text-muted-foreground">Group Orders</div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Overview</h2>
          <DashboardStats stats={dashboardStats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Profile & Quick Actions */}
          <div className="lg:col-span-1 space-y-8">
            <UserProfileCard 
              user={{
                name: user.name || 'User',
                email: user.email || 'user@example.com',
                role: user.role,
                isVerified: user.isVerified
              }} 
              memberSince={memberSince} 
            />
            <QuickActions actions={quickActions} />
          </div>

          {/* Right Column - Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity activities={recentActivities} />
          </div>
        </div>

        {/* Order History Widget */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Order History</h2>
          <OrderHistoryWidget userId={user.id} />
        </div>

        {/* Payment History */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Payment History</h2>
          <PaymentHistory userId={user.id} />
        </div>
      </MainContainer>
    </PageLayout>
  );
}
