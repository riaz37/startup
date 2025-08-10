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

interface GroupOrder {
  id: string;
  batchNumber: string;
  minThreshold: number;
  currentAmount: number;
  targetQuantity: number;
  currentQuantity: number;
  pricePerUnit: number;
  status: string;
  expiresAt: string;
  estimatedDelivery: string | null;
  progressPercentage: number;
  participantCount: number;
  timeRemaining: number;
  product: {
    id: string;
    name: string;
    unit: string;
    unitSize: number;
  };
}

async function getAdminGroupOrders(): Promise<GroupOrder[]> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  try {
    const response = await fetch(`${baseUrl}/api/group-orders`, {
      cache: "no-store"
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch group orders");
    }
    
    const data = await response.json();
    return data.groupOrders;
  } catch (error) {
    console.error("Error fetching group orders:", error);
    return [];
  }
}

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const groupOrders = await getAdminGroupOrders();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COLLECTING":
        return "bg-blue-100 text-blue-800";
      case "THRESHOLD_MET":
        return "bg-green-100 text-green-800";
      case "ORDERED":
        return "bg-yellow-100 text-yellow-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const activeOrders = groupOrders.filter(order => 
    order.status === "COLLECTING" || order.status === "THRESHOLD_MET"
  );
  const completedOrders = groupOrders.filter(order => 
    order.status === "DELIVERED"
  );
  const totalRevenue = groupOrders.reduce((sum, order) => sum + order.currentAmount, 0);

  const handleStatusUpdate = (orderId: string, status: string, additionalData?: unknown) => {
    const body = additionalData ? { status, ...additionalData } : { status };
    fetch(`/api/group-orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(() => window.location.reload());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AdminNavigation user={user} />

      <MainContainer>
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-4xl font-bold">
              Admin{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor and manage all group orders, track performance, and oversee platform operations.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          <AdminStatsCard
            icon={Package}
            title="Total Group Orders"
            value={groupOrders.length}
            iconColor="primary"
          />
          <AdminStatsCard
            icon={Zap}
            title="Active Orders"
            value={activeOrders.length}
            iconColor="accent"
          />
          <AdminStatsCard
            icon={CheckCircle}
            title="Completed Orders"
            value={completedOrders.length}
            iconColor="secondary"
          />
          <AdminStatsCard
            icon={DollarSign}
            title="Total Revenue"
            value={formatPrice(totalRevenue)}
            iconColor="primary"
          />
        </div>

        {/* Quick Actions */}
        <Card className="card-sohozdaam mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-6 w-6 text-primary mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1" asChild>
                <Link href="/admin/group-orders/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Group Order
                </Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/products">
                  <Package className="h-4 w-4 mr-2" />
                  View Products
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Group Orders Management */}
        <Card className="card-sohozdaam">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-6 w-6 text-primary mr-2" />
              All Group Orders
            </CardTitle>
            <p className="text-muted-foreground">
              Monitor and manage all group orders across the platform
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {groupOrders.length === 0 ? (
              <div className="p-12">
                <EmptyState
                  icon={Package}
                  title="No Group Orders Found"
                  description="Create your first group order to get started with the admin dashboard."
                  actionLabel="Create Group Order"
                  actionHref="/admin/group-orders/create"
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {groupOrders.map((order) => (
                  <AdminGroupOrderRow
                    key={order.id}
                    order={order}
                    formatPrice={formatPrice}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </MainContainer>
    </div>
  );
}