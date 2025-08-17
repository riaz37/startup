"use client";

import { ClientPageLayout, MainContainer } from "@/components/layout";
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
  TrendingUp,
  Loader2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { useAdminStats } from "@/hooks/api/use-admin-stats";
import { useSession } from "next-auth/react";

export default function AdminPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { data: stats, isLoading, error, refetch } = useAdminStats();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <ClientPageLayout hideNavigation={true}>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Access denied. Admin privileges required.</p>
            </div>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

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

  if (isLoading) {
    return (
      <ClientPageLayout user={user} hideNavigation={true}>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading admin dashboard...</p>
            </div>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  if (error || !stats) {
    return (
      <ClientPageLayout user={user} hideNavigation={true}>
        <MainContainer>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error loading admin dashboard: {error?.message}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  return (
    <ClientPageLayout user={user} hideNavigation={true}>
      <AdminNavigation user={{ name: user?.name || 'Admin', role: user?.role || 'ADMIN' }} />
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
              value={formatNumber(stats.users.total)}
              icon={Users}
              subtitle={`+${stats.users.new} this month`}
              trend={stats.users.growth}
            />
            <AdminStatsCard
              title="Active Orders"
              value={formatNumber(stats.orders.active)}
              icon={Package}
              subtitle={`${stats.orders.completed} completed`}
              trend={stats.orders.growth}
            />
            <AdminStatsCard
              title="Revenue"
              value={formatCurrency(stats.revenue.total)}
              icon={DollarSign}
              subtitle={`${stats.revenue.currency}`}
              trend={stats.revenue.growth}
            />
            <AdminStatsCard
              title="Group Orders"
              value={formatNumber(stats.groupOrders.total)}
              icon={Zap}
              subtitle={`${stats.groupOrders.active} active`}
              trend={stats.groupOrders.growth}
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Discount Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/discounts">Manage Discounts</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Priority Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/priority-orders">Manage Priority Orders</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Handle MRP-priced orders with admin-set delivery dates
                </p>
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
              {stats.groupOrders.recent.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No Group Orders"
                  description="Group orders will appear here once they are created."
                  actionLabel="Create Group Order"
                  actionHref="/admin/group-orders/create"
                />
              ) : (
                <div className="space-y-4">
                  {stats.groupOrders.recent.map((groupOrder) => (
                    <div key={groupOrder.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-medium">{groupOrder.productName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {groupOrder.currentQuantity} / {groupOrder.targetQuantity} units
                            </p>
                          </div>
                          {getStatusBadge(groupOrder.status)}
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{groupOrder.participantCount} participants</span>
                            <span>{groupOrder.progressPercentage.toFixed(1)}% complete</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performing Products */}
          {stats.products.topPerforming.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Top Performing Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.products.topPerforming.map((product) => (
                    <div key={product.productId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{product.productName}</h4>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(product.revenue)}</p>
                        <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </MainContainer>
    </ClientPageLayout>
  );
}