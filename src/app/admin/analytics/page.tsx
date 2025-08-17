"use client";

import { MainContainer } from "@/components/layout";
import { AdminNavigation } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  ShoppingCart,
  Calendar,
  Target,
  Loader2
} from "lucide-react";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { useDashboardAnalytics } from "@/hooks/api/use-analytics";
import { useSession } from "next-auth/react";


export default function AnalyticsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { data: analyticsData, isLoading, error } = useDashboardAnalytics();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Access denied. Admin privileges required.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading analytics data</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-BD").format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
              <AdminNavigation user={{ name: user?.name || 'Admin', role: user?.role || 'ADMIN' }} />

      <MainContainer>
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-4xl font-bold">
              Business{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Analytics
              </span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive insights into platform performance, user behavior, and business metrics.
          </p>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard />

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-sohozdaam">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.users.totalUsers)}</p>
                  <p className="text-xs text-green-600">+{analyticsData.users.userGrowth.toFixed(1)}% this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.orders.totalOrders)}</p>
                  <p className="text-xs text-green-600">+{analyticsData.orders.orderGrowth.toFixed(1)}% this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(analyticsData.revenue.totalRevenue)}</p>
                  <p className="text-xs text-green-600">+{analyticsData.revenue.revenueGrowth.toFixed(1)}% this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Group Orders</p>
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.groupOrders.totalGroupOrders)}</p>
                  <p className="text-xs text-green-600">{analyticsData.groupOrders.activeGroupOrders} active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="card-sohozdaam">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-6 w-6 text-primary mr-2" />
                Conversion Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Group Order Success Rate</span>
                  <Badge variant="default">{analyticsData.groupOrders.successRate.toFixed(1)}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Order Completion Rate</span>
                  <Badge variant="default">
                    {analyticsData.orders.totalOrders > 0 
                      ? ((analyticsData.orders.completedOrders / analyticsData.orders.totalOrders) * 100).toFixed(1)
                      : 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">User Verification Rate</span>
                  <Badge variant="default">
                    {analyticsData.users.totalUsers > 0 
                      ? ((analyticsData.users.totalUsers - (analyticsData.users.totalUsers - analyticsData.users.activeUsers)) / analyticsData.users.totalUsers * 100).toFixed(1)
                      : 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Revenue per User</span>
                  <Badge variant="default">
                    {formatCurrency(analyticsData.users.totalUsers > 0 
                      ? analyticsData.revenue.totalRevenue / analyticsData.users.totalUsers
                      : 0)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-6 w-6 text-primary mr-2" />
                Business Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Monthly Revenue Target</span>
                    <span>{formatCurrency(analyticsData.revenue.totalRevenue)} / ৳3.0M</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.min((analyticsData.revenue.totalRevenue / 3000000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>User Growth Target</span>
                    <span>{formatNumber(analyticsData.users.totalUsers)} / 1,500</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.min((analyticsData.users.totalUsers / 1500) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Order Volume Target</span>
                    <span>{formatNumber(analyticsData.orders.totalOrders)} / 4,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.min((analyticsData.orders.totalOrders / 4000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time-based Analytics */}
        <Card className="card-sohozdaam mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-6 w-6 text-primary mr-2" />
              Monthly Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h4 className="font-medium mb-2">Revenue Growth</h4>
                <div className={`text-2xl font-bold ${analyticsData.revenue.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.revenue.revenueGrowth >= 0 ? '+' : ''}{analyticsData.revenue.revenueGrowth.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">vs. last month</p>
              </div>
              
              <div className="text-center">
                <h4 className="font-medium mb-2">User Growth</h4>
                <div className={`text-2xl font-bold ${analyticsData.users.userGrowth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {analyticsData.users.userGrowth >= 0 ? '+' : ''}{analyticsData.users.userGrowth.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">vs. last month</p>
              </div>
              
              <div className="text-center">
                <h4 className="font-medium mb-2">Order Growth</h4>
                <div className={`text-2xl font-bold ${analyticsData.orders.orderGrowth >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {analyticsData.orders.orderGrowth >= 0 ? '+' : ''}{analyticsData.orders.orderGrowth.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">vs. last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </MainContainer>
    </div>
  );
} 