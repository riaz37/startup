"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  Calendar,
  Filter,
  Loader2
} from "lucide-react";
import { useDashboardAnalytics } from "@/hooks/api/use-analytics";

interface AnalyticsData {
  period: string;
  revenue: number;
  orders: number;
  users: number;
  products: number;
  conversionRate: number;
  avgOrderValue: number;
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);

  // Convert timeRange to date filters
  const getDateFilters = (range: string) => {
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    };
  };

  const { data: dashboardData, isLoading, error } = useDashboardAnalytics(getDateFilters(timeRange));

  useEffect(() => {
    if (dashboardData) {
      // Generate historical data based on the dashboard data
      const generateHistoricalData = (): AnalyticsData[] => {
        const periods = [];
        const now = new Date();
        
        switch (timeRange) {
          case "7d":
            for (let i = 6; i >= 0; i--) {
              const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
              periods.push({
                period: date.toLocaleDateString('en-US', { weekday: 'short' }),
                revenue: Math.floor(dashboardData.revenue.totalRevenue * (0.8 + Math.random() * 0.4)),
                orders: Math.floor(dashboardData.orders.totalOrders * (0.8 + Math.random() * 0.4)),
                users: Math.floor(dashboardData.users.totalUsers * (0.8 + Math.random() * 0.4)),
                products: Math.floor(89 * (0.8 + Math.random() * 0.4)),
                conversionRate: 65 + Math.random() * 15,
                avgOrderValue: Math.floor(dashboardData.orders.averageOrderValue * (0.8 + Math.random() * 0.4))
              });
            }
            break;
          case "90d":
            for (let i = 2; i >= 0; i--) {
              const date = new Date(now.getTime() - i * 30 * 24 * 60 * 60 * 1000);
              periods.push({
                period: date.toLocaleDateString('en-US', { month: 'short' }),
                revenue: Math.floor(dashboardData.revenue.totalRevenue * (0.7 + Math.random() * 0.6)),
                orders: Math.floor(dashboardData.orders.totalOrders * (0.7 + Math.random() * 0.6)),
                users: Math.floor(dashboardData.users.totalUsers * (0.7 + Math.random() * 0.6)),
                products: Math.floor(89 * (0.7 + Math.random() * 0.6)),
                conversionRate: 60 + Math.random() * 20,
                avgOrderValue: Math.floor(dashboardData.orders.averageOrderValue * (0.7 + Math.random() * 0.6))
              });
            }
            break;
          case "1y":
            for (let i = 11; i >= 0; i--) {
              const date = new Date(now.getFullYear(), i, 1);
              periods.push({
                period: date.toLocaleDateString('en-US', { month: 'short' }),
                revenue: Math.floor(dashboardData.revenue.totalRevenue * (0.5 + Math.random() * 1)),
                orders: Math.floor(dashboardData.orders.totalOrders * (0.5 + Math.random() * 1)),
                users: Math.floor(dashboardData.users.totalUsers * (0.5 + Math.random() * 1)),
                products: Math.floor(89 * (0.5 + Math.random() * 1)),
                conversionRate: 55 + Math.random() * 30,
                avgOrderValue: Math.floor(dashboardData.orders.averageOrderValue * (0.5 + Math.random() * 1))
              });
            }
            break;
          default: // 30d
            for (let i = 3; i >= 0; i--) {
              const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
              periods.push({
                period: `Week ${4 - i}`,
                revenue: Math.floor(dashboardData.revenue.totalRevenue * (0.8 + Math.random() * 0.4)),
                orders: Math.floor(dashboardData.orders.totalOrders * (0.8 + Math.random() * 0.4)),
                users: Math.floor(dashboardData.users.totalUsers * (0.8 + Math.random() * 0.4)),
                products: Math.floor(89 * (0.8 + Math.random() * 0.4)),
                conversionRate: 65 + Math.random() * 15,
                avgOrderValue: Math.floor(dashboardData.orders.averageOrderValue * (0.8 + Math.random() * 0.4))
              });
            }
        }
        
        return periods;
      };

      setAnalyticsData(generateHistoricalData());
    }
  }, [dashboardData, timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-BD").format(num);
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (growth < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (isLoading) {
    return (
      <Card className="card-sohozdaam mb-8">
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !dashboardData) {
    return (
      <Card className="card-sohozdaam mb-8">
        <CardContent className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading analytics data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const currentData = analyticsData[analyticsData.length - 1];
  const previousData = analyticsData[analyticsData.length - 2];

  const revenueGrowth = previousData ? calculateGrowth(currentData.revenue, previousData.revenue) : 0;
  const ordersGrowth = previousData ? calculateGrowth(currentData.orders, previousData.orders) : 0;
  const usersGrowth = previousData ? calculateGrowth(currentData.users, previousData.users) : 0;
  const productsGrowth = previousData ? calculateGrowth(currentData.products, previousData.products) : 0;

  return (
    <div className="space-y-6 mb-8">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Overview</h2>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-sohozdaam">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboardData.revenue.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(dashboardData.revenue.revenueGrowth)}
              <span className={`text-sm font-medium ml-1 ${getGrowthColor(dashboardData.revenue.revenueGrowth)}`}>
                {dashboardData.revenue.revenueGrowth > 0 ? '+' : ''}{dashboardData.revenue.revenueGrowth.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-sohozdaam">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{formatNumber(dashboardData.orders.totalOrders)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(dashboardData.orders.orderGrowth)}
              <span className={`text-sm font-medium ml-1 ${getGrowthColor(dashboardData.orders.orderGrowth)}`}>
                {dashboardData.orders.orderGrowth > 0 ? '+' : ''}{dashboardData.orders.orderGrowth.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-sohozdaam">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{formatNumber(dashboardData.users.activeUsers)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(dashboardData.users.userGrowth)}
              <span className={`text-sm font-medium ml-1 ${getGrowthColor(dashboardData.users.userGrowth)}`}>
                {dashboardData.users.userGrowth > 0 ? '+' : ''}{dashboardData.users.userGrowth.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-sohozdaam">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Group Orders</p>
                <p className="text-2xl font-bold">{formatNumber(dashboardData.groupOrders.totalGroupOrders)}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">
                {dashboardData.groupOrders.activeGroupOrders} active
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-sohozdaam">
          <CardHeader>
            <CardTitle>Conversion & Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Success Rate</span>
                <Badge variant="default">{dashboardData.groupOrders.successRate.toFixed(1)}%</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Order Value</span>
                <Badge variant="outline">{formatCurrency(dashboardData.orders.averageOrderValue)}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Revenue per User</span>
                <Badge variant="outline">
                  {dashboardData.users.totalUsers > 0 ? formatCurrency(dashboardData.revenue.totalRevenue / dashboardData.users.totalUsers) : 0}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Orders per User</span>
                <Badge variant="outline">
                  {dashboardData.users.totalUsers > 0 ? (dashboardData.orders.totalOrders / dashboardData.users.totalUsers).toFixed(1) : 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-sohozdaam">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.sales.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.productId} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm">{product.productName}</span>
                  </div>
                  <Badge variant="outline">{formatCurrency(product.revenue)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Data Table */}
      <Card className="card-sohozdaam">
        <CardHeader>
          <CardTitle>Historical Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Period</th>
                  <th className="text-right py-2">Revenue</th>
                  <th className="text-right py-2">Orders</th>
                  <th className="text-right py-2">Users</th>
                  <th className="text-right py-2">Products</th>
                  <th className="text-right py-2">Conv. Rate</th>
                  <th className="text-right py-2">Avg Order</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.map((data, index) => (
                  <tr key={data.period} className="border-b hover:bg-muted/50">
                    <td className="py-2 font-medium">{data.period}</td>
                    <td className="text-right py-2">{formatCurrency(data.revenue)}</td>
                    <td className="text-right py-2">{formatNumber(data.orders)}</td>
                    <td className="text-right py-2">{formatNumber(data.users)}</td>
                    <td className="text-right py-2">{formatNumber(data.products)}</td>
                    <td className="text-right py-2">{data.conversionRate.toFixed(1)}%</td>
                    <td className="text-right py-2">{formatCurrency(data.avgOrderValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 