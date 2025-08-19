"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package,
  ShoppingCart,
  Eye,
  MousePointer,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw,
  Filter,
  Search
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    conversionRate: number;
    averageOrderValue: number;
    activeUsers: number;
    newUsers: number;
    completedOrders: number;
  };
  trends: {
    users: { date: string; count: number }[];
    orders: { date: string; count: number }[];
    revenue: { date: string; amount: number }[];
  };
  userBehavior: {
    topProducts: { productId: string; orders: number; quantity: number }[];
  };
  conversion: {
    funnel: { stage: string; count: number; conversion: number }[];
  };
}

interface AnalyticsDashboardProps {
  data?: AnalyticsData;
  loading?: boolean;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  onExport?: () => void;
  onRefresh?: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsDashboard({
  data,
  loading = false,
  timeRange = "30d",
  onTimeRangeChange,
  onExport,
  onRefresh
}: AnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<AnalyticsData | null>(data);

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    onTimeRangeChange?.(range);
  };

  // Apply filters when data or search term changes
  useEffect(() => {
    if (!data) {
      setFilteredData(null);
      return;
    }

    if (!searchTerm) {
      setFilteredData(data);
      return;
    }

    // Filter data based on search term
    const filtered = {
      ...data,
      userBehavior: {
        ...data.userBehavior,
        topProducts: data.userBehavior.topProducts.filter(product =>
          product.productId.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
    };
    setFilteredData(filtered);
  }, [data, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${Math.round(num * 100) / 100}%`;
  };

  // Prepare chart data
  const prepareChartData = (data: any[], key: string, valueKey: string) => {
    return data.map(item => ({
      name: item[key],
      value: item[valueKey]
    }));
  };

  if (loading || !filteredData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-muted rounded"></div>
                  <div className="ml-4 w-0 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(filteredData.overview.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              +{filteredData.overview.newUsers} new this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(filteredData.overview.totalOrders)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(filteredData.overview.completedOrders)} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(filteredData.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(filteredData.overview.averageOrderValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(filteredData.overview.conversionRate)}</div>
            <p className="text-xs text-muted-foreground">
              From {formatNumber(filteredData.overview.totalUsers)} users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(filteredData.overview.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per completed order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(filteredData.overview.activeUsers)}</div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Revenue Range</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All ranges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (0-1000)</SelectItem>
                    <SelectItem value="medium">Medium (1000-5000)</SelectItem>
                    <SelectItem value="high">High (5000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="orders">Orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filteredData.trends.users}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value) => [formatNumber(value as number), "Users"]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={filteredData.trends.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value) => [formatCurrency(value as number), "Revenue"]}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#00C49F" 
                      fill="#00C49F" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredData.conversion.funnel} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" width={100} />
                    <Tooltip 
                      formatter={(value) => [formatNumber(value as number), "Users"]}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredData.conversion.funnel.map((stage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{stage.stage}</span>
                        <span className="font-medium">{formatPercentage(stage.conversion)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(stage.conversion, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatNumber(stage.count)} users
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Products Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredData.userBehavior.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productId" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatNumber(value as number), 
                        name === "orders" ? "Orders" : "Quantity"
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="orders" fill="#8884d8" name="Orders" />
                    <Bar dataKey="quantity" fill="#82ca9d" name="Quantity" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={prepareChartData(filteredData.userBehavior.topProducts, "productId", "orders")}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareChartData(filteredData.userBehavior.topProducts, "productId", "orders").map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatNumber(value as number), "Orders"]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Custom Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-32 flex-col">
                  <Users className="h-8 w-8 mb-2" />
                  User Report
                </Button>
                <Button variant="outline" className="h-32 flex-col">
                  <Package className="h-8 w-8 mb-2" />
                  Order Report
                </Button>
                <Button variant="outline" className="h-32 flex-col">
                  <DollarSign className="h-8 w-8 mb-2" />
                  Revenue Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 