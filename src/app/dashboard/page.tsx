"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageHeader, MainContainer } from "@/components/layout";
import { ClientPageLayout } from "@/components/layout/client-page-layout";
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
  Star,
  Clock
} from "lucide-react";
import OrderHistoryWidget from "@/components/orders/order-history-widget";
import { useState } from "react";
import { DashboardStatsSkeleton } from "@/components/ui/skeleton";

interface DashboardData {
  totalOrders: number;
  groupOrdersJoined: number;
  totalProducts: number;
  totalSavings: number;
  recentOrders: Array<{
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
  recentGroupOrders: Array<{
    id: string;
    status: string;
    productName: string;
    progressPercentage: number;
    createdAt: string;
  }>;
  userStats: {
    createdAt: string;
    email: string;
    name: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
            }
  };

  // Show loading state
  if (status === "loading" || loading) {
    return (
      <ClientPageLayout user={session?.user}>
        <MainContainer>
          {/* Enhanced Page Header Loading */}
          <div className="mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-10 w-80 bg-muted rounded animate-pulse" />
                <div className="h-5 w-96 bg-muted/60 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Enhanced Welcome Stats Loading */}
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 rounded-2xl p-8 mb-12 border border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="text-center md:text-left space-y-3">
                <div className="h-8 w-64 bg-muted rounded animate-pulse mx-auto md:mx-0" />
                <div className="h-5 w-48 bg-muted/60 rounded animate-pulse mx-auto md:mx-0" />
              </div>
              <div className="text-center space-y-2">
                <div className="h-12 w-32 bg-muted rounded animate-pulse mx-auto" />
                <div className="h-4 w-24 bg-muted/60 rounded animate-pulse mx-auto" />
              </div>
              <div className="text-center space-y-2">
                <div className="h-12 w-32 bg-muted rounded animate-pulse mx-auto" />
                <div className="h-4 w-24 bg-muted/60 rounded animate-pulse mx-auto" />
              </div>
            </div>
          </div>

          {/* Enhanced Dashboard Stats Loading */}
          <div className="mb-12">
            <div className="h-8 w-32 bg-muted rounded animate-pulse mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-lg p-6 bg-card relative overflow-hidden group">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        <div className="h-8 w-20 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                      </div>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
                      <div className="h-4 w-20 bg-muted/60 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Content Grid Loading */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column Loading */}
            <div className="lg:col-span-1 space-y-8">
              {/* Profile Card Loading */}
              <div className="border rounded-lg p-6 bg-card">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-24 bg-muted/60 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted/60 rounded animate-pulse" />
                  </div>
                </div>
              </div>
              
              {/* Quick Actions Loading */}
              <div className="border rounded-lg p-6 bg-card">
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Loading */}
            <div className="lg:col-span-2">
              <div className="border rounded-lg p-6 bg-card">
                <div className="space-y-4">
                  <div className="h-6 w-40 bg-muted rounded animate-pulse" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-48 bg-muted/60 rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Order History Loading */}
          <div className="mb-8">
            <div className="h-8 w-40 bg-muted rounded animate-pulse mb-6" />
            <div className="border rounded-lg p-6 bg-card">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-24 bg-muted/60 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Loading Progress Indicator */}
          <div className="text-center py-8">
            <div className="inline-flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse"></div>
                <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-medium text-muted-foreground animate-pulse">
                  Loading your Sohozdaam dashboard...
                </div>
                <div className="text-sm text-muted-foreground/60">
                  Preparing your personalized experience
                </div>
              </div>
            </div>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  // Show unauthenticated state
  if (status === "unauthenticated") {
    return null; // Will redirect via useEffect
  }

  // Show error state if no session
  if (!session?.user) {
    return null; // Will redirect via useEffect
  }

  const user = session.user;

  // Use dashboard data if available, otherwise show loading
  if (!dashboardData) {
    return (
      <ClientPageLayout user={session?.user}>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  // Calculate derived values
  const totalSavingsAmount = dashboardData.totalSavings || 0;
  const productsCount = dashboardData.totalProducts || 0;
  const memberSince = dashboardData.userStats?.createdAt ? 
    Math.floor((Date.now() - new Date(dashboardData.userStats.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Dashboard stats with real data
  const dashboardStats = [
    {
      icon: ShoppingCart,
      title: "Total Orders",
      value: dashboardData.totalOrders.toString(),
      change: `${dashboardData.recentOrders.length} this month`,
      trend: "up" as const,
      color: "primary" as const,
      description: "Your order history"
    },
    {
      icon: Users,
      title: "Group Orders",
      value: dashboardData.groupOrdersJoined.toString(),
      change: `${dashboardData.recentGroupOrders.length} recent`,
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
              value: `৳${totalSavingsAmount.toFixed(0)}`,
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
    },
    {
      icon: Clock,
      title: "Priority Orders",
      description: "Fast delivery at MRP price",
      href: "/priority-orders",
      color: "success" as const,
      badge: "Fast"
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
    ...dashboardData.recentOrders.map((order) => ({
      id: order.id,
      type: "order" as const,
      title: `Order #${order.id.slice(-6)}`,
      description: `Order - ${order.status}`,
      timestamp: order.createdAt,
      status: order.status,
      href: `/orders/${order.id}`,
      amount: order.totalAmount
    })),
    ...dashboardData.recentGroupOrders.map((order) => ({
      id: order.id,
      type: "group_order" as const,
      title: `Joined ${order.productName}`,
      description: `Group Order - ${order.status}`,
      timestamp: order.createdAt,
      status: order.status,
      href: `/group-orders/${order.id}`,
      progress: order.progressPercentage / 100
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
   .slice(0, 8);

  return (
    <ClientPageLayout user={session?.user}>
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
                Member for {memberSince} days • {dashboardData.totalOrders} orders placed
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                ৳{totalSavingsAmount.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Investment</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-1">
                {dashboardData.groupOrdersJoined}
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
    </ClientPageLayout>
  );
}
