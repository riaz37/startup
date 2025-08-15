import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/home/navigation";
import { Footer } from "@/components/home/footer";
import { MainContainer } from "@/components/layout";
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
  CreditCard
} from "lucide-react";
import OrderHistoryWidget from "@/components/orders/order-history-widget";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Mock data - in real app, fetch from API
  const dashboardStats = [
    {
      icon: ShoppingCart,
      title: "Total Orders",
      value: "12",
      change: "+2 this month",
      trend: "up" as const,
      color: "primary" as const
    },
    {
      icon: Users,
      title: "Group Orders Joined",
      value: "8",
      change: "+3 this month",
      trend: "up" as const,
      color: "secondary" as const
    },
    {
      icon: Package,
      title: "Products Ordered",
      value: "24",
      change: "+5 this month",
      trend: "up" as const,
      color: "accent" as const
    },
    {
      icon: TrendingUp,
      title: "Total Savings",
      value: "₹2,450",
      change: "+₹340 this month",
      trend: "up" as const,
      color: "primary" as const
    }
  ];

  const quickActions = [
    {
      icon: Users,
      title: "Browse Group Orders",
      description: "Join bulk orders & save",
      href: "/group-orders",
      color: "primary" as const
    },
    {
      icon: Package,
      title: "View Products",
      description: "Browse our catalog",
      href: "/products",
      color: "secondary" as const
    },
    {
      icon: ShoppingCart,
      title: "My Orders",
      description: "Track your orders",
      href: "/orders",
      color: "accent" as const
    },
    {
      icon: Heart,
      title: "Help & Support",
      description: "Get assistance",
      href: "/help",
      color: "secondary" as const
    }
  ];

  // Add admin action if user is admin
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    quickActions.push({
      icon: Settings,
      title: "Admin Panel",
      description: "Manage platform",
      href: "/admin",
      color: "primary" as const
    });
  }

  // Mock recent activity - in real app, fetch from API
  const recentActivities = [
    {
      id: "1",
      type: "group_order" as const,
      title: "Joined Rice Group Order",
      description: "Successfully joined bulk rice order with 15 other participants",
      timestamp: "2 hours ago",
      status: "confirmed"
    },
    {
      id: "2",
      type: "order" as const,
      title: "Order #1234 Delivered",
      description: "Your organic vegetables order has been delivered",
      timestamp: "1 day ago",
      status: "delivered"
    },
    {
      id: "3",
      type: "group_order" as const,
      title: "Wheat Group Order Threshold Met",
      description: "The wheat group order you joined has reached its minimum threshold",
      timestamp: "2 days ago",
      status: "confirmed"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navigation user={user} />

      <MainContainer>
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {user.name?.split(' ')[0] || 'User'}
            </span>
            ! 👋
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Here&apos;s what&apos;s happening with your group orders and savings today.
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-12">
          <DashboardStats stats={dashboardStats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Profile & Quick Actions */}
          <div className="lg:col-span-1 space-y-8">
            <UserProfileCard user={user} />
            <QuickActions actions={quickActions} />
          </div>

          {/* Right Column - Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity activities={recentActivities} />
          </div>
        </div>

        {/* Order History Widget */}
        <div className="mb-8">
          <OrderHistoryWidget userId={user.id} />
        </div>

        {/* Payment History */}
        <div className="mb-8">
          <PaymentHistory userId={user.id} />
        </div>
      </MainContainer>

      <Footer />
    </div>
  );
}
