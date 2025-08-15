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
  Filter
} from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    
    // Mock data - in real app, fetch from API
    const mockData: AnalyticsData[] = [
      {
        period: "Jan",
        revenue: 1800000,
        orders: 2800,
        users: 980,
        products: 75,
        conversionRate: 68.5,
        avgOrderValue: 642,
      },
      {
        period: "Feb",
        revenue: 2100000,
        orders: 3200,
        users: 1120,
        products: 78,
        conversionRate: 71.2,
        avgOrderValue: 656,
      },
      {
        period: "Mar",
        revenue: 1950000,
        orders: 3000,
        users: 1080,
        products: 80,
        conversionRate: 69.8,
        avgOrderValue: 650,
      },
      {
        period: "Apr",
        revenue: 2400000,
        orders: 3456,
        users: 1247,
        products: 89,
        conversionRate: 72.1,
        avgOrderValue: 694,
      },
    ];

    setAnalyticsData(mockData);
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
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
                <p className="text-2xl font-bold">{formatCurrency(currentData.revenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(revenueGrowth)}
              <span className={`text-sm font-medium ml-1 ${getGrowthColor(revenueGrowth)}`}>
                {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
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
                <p className="text-2xl font-bold">{formatNumber(currentData.orders)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(ordersGrowth)}
              <span className={`text-sm font-medium ml-1 ${getGrowthColor(ordersGrowth)}`}>
                {ordersGrowth > 0 ? '+' : ''}{ordersGrowth.toFixed(1)}%
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
                <p className="text-2xl font-bold">{formatNumber(currentData.users)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(usersGrowth)}
              <span className={`text-sm font-medium ml-1 ${getGrowthColor(usersGrowth)}`}>
                {usersGrowth > 0 ? '+' : ''}{usersGrowth.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-sohozdaam">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Products</p>
                <p className="text-2xl font-bold">{formatNumber(currentData.products)}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2">
              {getGrowthIcon(productsGrowth)}
              <span className={`text-sm font-medium ml-1 ${getGrowthColor(productsGrowth)}`}>
                {productsGrowth > 0 ? '+' : ''}{productsGrowth.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">vs last period</span>
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
                <span className="text-sm">Conversion Rate</span>
                <Badge variant="default">{currentData.conversionRate}%</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Order Value</span>
                <Badge variant="outline">{formatCurrency(currentData.avgOrderValue)}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Revenue per User</span>
                <Badge variant="outline">
                  {formatCurrency(currentData.revenue / currentData.users)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Orders per User</span>
                <Badge variant="outline">
                  {(currentData.orders / currentData.users).toFixed(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-sohozdaam">
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Revenue Trend</span>
                  <span>{revenueGrowth > 0 ? '↗' : '↘'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${revenueGrowth > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(Math.abs(revenueGrowth), 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>User Growth</span>
                  <span>{usersGrowth > 0 ? '↗' : '↘'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${usersGrowth > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(Math.abs(usersGrowth), 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Order Volume</span>
                  <span>{ordersGrowth > 0 ? '↗' : '↘'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${ordersGrowth > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(Math.abs(ordersGrowth), 100)}%` }}
                  ></div>
                </div>
              </div>
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
                    <td className="text-right py-2">{data.conversionRate}%</td>
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