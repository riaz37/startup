"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminNavigation } from "@/components/admin";
import { MainContainer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Package, 
  Users, 
  Target, 
  DollarSign, 
  Calendar,
  Edit,
  Trash2,
  Loader2
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
  actualDelivery: string | null;
  progressPercentage: number;
  participantCount: number;
  timeRemaining: number;
  product: {
    id: string;
    name: string;
    unit: string;
    unitSize: number;
  };
  createdAt: string;
  orders: Array<{
    id: string;
    totalAmount: number;
    items: Array<{
      quantity: number;
    }>;
  }>;
}

export default function GroupOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchGroupOrder(params.id as string);
    }
  }, [params.id]);

  const fetchGroupOrder = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/group-orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setGroupOrder(data.groupOrder);
      } else {
        throw new Error("Failed to fetch group order");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch group order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string, additionalData?: any) => {
    try {
      const response = await fetch(`/api/admin/group-orders/${params.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, ...additionalData }),
      });

      if (response.ok) {
        // Refresh the group order data
        await fetchGroupOrder(params.id as string);
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this group order? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/group-orders/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/group-orders");
      } else {
        throw new Error("Failed to delete group order");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete group order");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COLLECTING":
        return <Badge className="badge-warning">Collecting</Badge>;
      case "THRESHOLD_MET":
        return <Badge className="badge-success">Threshold Met</Badge>;
      case "ORDERED":
        return <Badge className="badge-secondary">Ordered</Badge>;
      case "SHIPPED":
        return <Badge className="badge-primary">Shipped</Badge>;
      case "DELIVERED":
        return <Badge className="badge-success">Delivered</Badge>;
      case "EXPIRED":
        return <Badge variant="destructive">Expired</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionButton = () => {
    if (!groupOrder) return null;

    switch (groupOrder.status) {
      case "THRESHOLD_MET":
        return (
          <Button
            className="bg-accent hover:bg-accent/90"
            onClick={() => handleStatusUpdate("ORDERED")}
          >
            Mark as Ordered
          </Button>
        );
      case "ORDERED":
        return (
          <Button
            className="bg-secondary hover:bg-secondary/90"
            onClick={() => handleStatusUpdate("SHIPPED")}
          >
            Mark as Shipped
          </Button>
        );
      case "SHIPPED":
        return (
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              const actualDelivery = new Date().toISOString();
              handleStatusUpdate("DELIVERED", { actualDelivery });
            }}
          >
            Mark as Delivered
          </Button>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <AdminNavigation user={{ name: "Admin", role: "ADMIN" }} />
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading group order...</p>
            </div>
          </div>
        </MainContainer>
      </div>
    );
  }

  if (error || !groupOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <AdminNavigation user={{ name: "Admin", role: "ADMIN" }} />
        <MainContainer>
          <div className="text-center py-8">
            <Alert variant="destructive">
              <AlertDescription>
                {error || "Group order not found"}
              </AlertDescription>
            </Alert>
            <Button className="mt-4" asChild>
              <Link href="/admin/group-orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Group Orders
              </Link>
            </Button>
          </div>
        </MainContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AdminNavigation user={{ name: "Admin", role: "ADMIN" }} />

      <MainContainer className="max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/group-orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Group Order Details</h1>
              <p className="text-muted-foreground">
                #{groupOrder.batchNumber} - {groupOrder.product.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {getActionButton()}
            <Button variant="outline" asChild>
              <Link href={`/admin/group-orders/${groupOrder.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status and Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Status & Progress</span>
                  {getStatusBadge(groupOrder.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{Math.round(groupOrder.progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(groupOrder.progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current Quantity:</span>
                    <span className="ml-2 font-medium">
                      {groupOrder.currentQuantity} / {groupOrder.targetQuantity} units
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Amount:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(groupOrder.currentAmount)} / {formatCurrency(groupOrder.minThreshold)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Product Name</span>
                    <span className="font-medium">{groupOrder.product.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Unit</span>
                    <span className="font-medium">{groupOrder.product.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Unit Size</span>
                    <span className="font-medium">{groupOrder.product.unitSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price Per Unit</span>
                    <span className="font-medium text-primary">
                      {formatCurrency(groupOrder.pricePerUnit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Orders ({groupOrder.participantCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupOrder.orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No orders placed yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {groupOrder.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Target Quantity</p>
                    <p className="text-2xl font-bold">{groupOrder.targetQuantity}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Participants</p>
                    <p className="text-2xl font-bold">{groupOrder.participantCount}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Min Threshold</p>
                    <p className="text-2xl font-bold">{formatCurrency(groupOrder.minThreshold)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(groupOrder.createdAt)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Expires</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(groupOrder.expiresAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {groupOrder.timeRemaining} days remaining
                    </p>
                  </div>
                  
                  {groupOrder.estimatedDelivery && (
                    <div>
                      <p className="text-sm font-medium">Estimated Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(groupOrder.estimatedDelivery)}
                      </p>
                    </div>
                  )}
                  
                  {groupOrder.actualDelivery && (
                    <div>
                      <p className="text-sm font-medium">Actual Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(groupOrder.actualDelivery)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainContainer>
    </div>
  );
} 