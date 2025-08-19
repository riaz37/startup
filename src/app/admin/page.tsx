"use client";

import { ClientPageLayout, MainContainer } from "@/components/layout";
import { AdminStatsCard } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  Package,
  TrendingUp,
  Clock,
  Settings,
  Mail,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAdminStats } from "@/hooks/api/use-admin-stats";

export default function AdminPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <ClientPageLayout>
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ClientPageLayout>
      <MainContainer>
        {/* Clean Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center mr-4">
                <Settings className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <Badge variant="secondary" className="text-sm">
                    {user.role}
                  </Badge>
                  <span className="text-muted-foreground">
                    Welcome back, {user.name}!
                  </span>
                </div>
              </div>
            </div>
            {user.role === "SUPER_ADMIN" && (
              <Button asChild>
                <Link href="/admin/users/create-admin">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Admin
                </Link>
              </Button>
            )}
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Here&apos;s what&apos;s happening on your platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            // Loading skeleton for stats
            Array.from({ length: 4 }).map((_, i) => (
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
            ))
          ) : statsError ? (
            // Error state for stats
            <div className="col-span-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-red-600 mb-4">Failed to load statistics</p>
                  <Button onClick={() => refetchStats()} variant="outline">
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Actual stats
            <>
              <AdminStatsCard
                title="Total Users"
                value={stats?.users?.total?.toString() || "0"}
                icon={Users}
                subtitle="Registered users"
                iconColor="primary"
              />
              <AdminStatsCard
                title="Total Orders"
                value={stats?.orders?.total?.toString() || "0"}
                icon={Package}
                subtitle="All time orders"
                iconColor="secondary"
              />
              <AdminStatsCard
                title="Total Revenue"
                value={stats?.revenue?.total ? formatCurrency(stats.revenue.total) : "৳0"}
                icon={DollarSign}
                subtitle="All time revenue"
                iconColor="accent"
              />
              <AdminStatsCard
                title="Active Group Orders"
                value={stats?.groupOrders?.active?.toString() || "0"}
                icon={Users}
                subtitle="Currently collecting"
                iconColor="primary"
              />
            </>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/users">Manage Users</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                View, edit, and manage user accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/orders">Manage All Orders</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Unified view of regular, priority, and group orders
              </p>
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
                <Package className="h-5 w-5 mr-2" />
                Product Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/products">Manage Products</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Add, edit, and manage product inventory
              </p>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Group Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/group-orders">Manage Group Orders</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Monitor bulk orders and manage thresholds
              </p>
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
                <Mail className="h-5 w-5 mr-2" />
                Email Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/email-management">Manage Emails</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Configure email templates and manage email campaigns
              </p>
            </CardContent>
          </Card>
        </div>
      </MainContainer>
    </ClientPageLayout>
  );
}