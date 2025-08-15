import { requireAdmin } from "@/lib/auth-utils";
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
  Target
} from "lucide-react";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export default async function AnalyticsPage() {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AdminNavigation user={user} />

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
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-xs text-green-600">+12% this month</p>
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
                  <p className="text-2xl font-bold">3,456</p>
                  <p className="text-xs text-green-600">+8% this month</p>
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
                  <p className="text-2xl font-bold">₹2.4M</p>
                  <p className="text-xs text-green-600">+15% this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-xs text-green-600">+3 this month</p>
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
                  <span className="text-sm">Group Order Join Rate</span>
                  <Badge variant="default">68%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Payment Success Rate</span>
                  <Badge variant="default">94.2%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Order Completion Rate</span>
                  <Badge variant="default">87.5%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Customer Retention</span>
                  <Badge variant="default">76.3%</Badge>
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
                    <span>₹3.0M / ₹2.4M</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>User Growth Target</span>
                    <span>1,500 / 1,247</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '83%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Order Volume Target</span>
                    <span>4,000 / 3,456</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '86%' }}></div>
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
                <div className="text-2xl font-bold text-green-600">+15.2%</div>
                <p className="text-sm text-muted-foreground">vs. last month</p>
              </div>
              
              <div className="text-center">
                <h4 className="font-medium mb-2">User Growth</h4>
                <div className="text-2xl font-bold text-blue-600">+12.8%</div>
                <p className="text-sm text-muted-foreground">vs. last month</p>
              </div>
              
              <div className="text-center">
                <h4 className="font-medium mb-2">Order Growth</h4>
                <div className="text-2xl font-bold text-purple-600">+8.4%</div>
                <p className="text-sm text-muted-foreground">vs. last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </MainContainer>
    </div>
  );
} 