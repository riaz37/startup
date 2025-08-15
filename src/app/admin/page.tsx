import { requireAdmin } from "@/lib/auth-utils";
import { MainContainer } from "@/components/layout";
import { EmptyState } from "@/components/common";
import { AdminNavigation, AdminStatsCard, AdminGroupOrderRow } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Zap, 
  CheckCircle, 
  DollarSign, 
  Plus, 
  Package,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { GroupOrder } from "@/types";

async function getAdminGroupOrders(): Promise<GroupOrder[]> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/group-orders`, {
      cache: "no-store"
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch admin group orders");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching admin group orders:", error);
    return [];
  }
}

export default async function AdminPage() {
  const groupOrders = await getAdminGroupOrders();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "collecting":
        return <Badge className="badge-warning">Collecting Orders</Badge>;
      case "threshold_met":
        return <Badge className="badge-success">Threshold Met</Badge>;
      case "processing":
        return <Badge className="badge-secondary">Processing</Badge>;
      case "shipped":
        return <Badge className="badge-primary">Shipped</Badge>;
      case "delivered":
        return <Badge className="badge-success">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your platform and monitor performance
            </p>
          </div>
          <div className="flex space-x-2">
            <Button asChild>
              <Link href="/admin/group-orders/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Group Order
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatsCard
            title="Total Users"
            value="2,847"
            icon={Users}
            trend="+12%"
            trendDirection="up"
          />
          <AdminStatsCard
            title="Active Orders"
            value="156"
            icon={Package}
            trend="+8%"
            trendDirection="up"
          />
          <AdminStatsCard
            title="Revenue"
            value="₹45,230"
            icon={DollarSign}
            trend="+23%"
            trendDirection="up"
          />
          <AdminStatsCard
            title="Group Orders"
            value="23"
            icon={Zap}
            trend="+5%"
            trendDirection="up"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Product Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/products">Manage Products</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/categories">Manage Categories</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/users">View Users</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/roles">Manage Roles</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/analytics">View Analytics</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/reports">Generate Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Group Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Group Orders</span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/group-orders">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupOrders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No Group Orders"
                description="Group orders will appear here once they are created."
                actionLabel="Create Group Order"
                actionHref="/admin/group-orders/create"
              />
            ) : (
              <div className="space-y-4">
                {groupOrders.slice(0, 5).map((groupOrder) => (
                  <AdminGroupOrderRow
                    key={groupOrder.id}
                    groupOrder={groupOrder}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainContainer>
  );
}