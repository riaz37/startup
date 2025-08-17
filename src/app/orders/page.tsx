import { getCurrentUser, prisma } from "@/lib";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { MainContainer } from "@/components/layout/main-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, MapPin, ArrowRight, ShoppingCart, Clock, CheckCircle, XCircle, Truck, AlertCircle } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  placedAt: string;
  groupOrder: {
    id: string;
    batchNumber: string;
    status: string;
    estimatedDelivery: string | null;
    product: {
      name: string;
      unit: string;
      unitSize: number;
      imageUrl: string | null;
    };
  };
  items: Array<{
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        groupOrder: {
          include: {
            product: {
              select: {
                name: true,
                unit: true,
                unitSize: true,
                imageUrl: true
              }
            }
          }
        },
        items: true
      },
      orderBy: {
        placedAt: "desc"
      }
    });

    return orders;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
}

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const orders = await getUserOrders(user.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, label: "Pending" };
      case "CONFIRMED":
        return { color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle, label: "Confirmed" };
      case "PROCESSING":
        return { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Package, label: "Processing" };
      case "SHIPPED":
        return { color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Truck, label: "Shipped" };
      case "DELIVERED":
        return { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, label: "Delivered" };
      case "CANCELLED":
        return { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle, label: "Cancelled" };
      default:
        return { color: "bg-gray-100 text-gray-800 border-gray-200", icon: AlertCircle, label: status.replace('_', ' ') };
    }
  };

  const getPaymentStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" };
      case "PROCESSING":
        return { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Processing" };
      case "COMPLETED":
        return { color: "bg-green-100 text-green-800 border-green-200", label: "Completed" };
      case "FAILED":
        return { color: "bg-red-100 text-red-800 border-red-200", label: "Failed" };
      default:
        return { color: "bg-gray-100 text-gray-800 border-gray-200", label: status.replace('_', ' ') };
    }
  };

  return (
    <PageLayout>
      <MainContainer>
        <PageHeader
          badge="Orders"
          title="Your Order"
          highlightedWord="History"
          description="Track your group order participations and delivery status across all your purchases"
        />

        {orders.length === 0 ? (
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-12 pb-12">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-6">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't joined any group orders yet. Start exploring our products and join group orders to save money!
              </p>
              <Button asChild className="w-full">
                <Link href="/group-orders">
                  Browse Group Orders
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const paymentStatusConfig = getPaymentStatusConfig(order.paymentStatus);
              const StatusIcon = statusConfig.icon;
              
              return (
                <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="font-mono">
                            #{order.orderNumber}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            Batch #{order.groupOrder.batchNumber}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Placed on {new Date(order.placedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={`${statusConfig.color} border`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <Badge variant="outline" className={paymentStatusConfig.color}>
                          {paymentStatusConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Product Details */}
                    <div className="flex items-start space-x-4">
                      {order.groupOrder.product.imageUrl ? (
                        <img
                          src={order.groupOrder.product.imageUrl}
                          alt={order.groupOrder.product.name}
                          className="h-20 w-20 object-cover rounded-lg border bg-muted"
                        />
                      ) : (
                        <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center border">
                          <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {order.groupOrder.product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {order.groupOrder.product.unitSize} {order.groupOrder.product.unit} per unit
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Quantity:</span>
                            <span className="ml-2 font-medium text-foreground">
                              {order.items[0]?.quantity} {order.groupOrder.product.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Unit Price:</span>
                            <span className="ml-2 font-medium text-foreground">
                              {formatPrice(order.items[0]?.unitPrice || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(order.totalAmount)}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Group Order Status */}
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <h4 className="font-medium text-foreground flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Group Order Status
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Badge className={`${getStatusConfig(order.groupOrder.status).color} border`}>
                            {getStatusConfig(order.groupOrder.status).label}
                          </Badge>
                        </div>
                        {order.groupOrder.estimatedDelivery && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Estimated Delivery:</span>
                            <span className="text-sm font-medium text-foreground">
                              {new Date(order.groupOrder.estimatedDelivery).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button variant="outline" asChild className="flex-1 sm:flex-none">
                        <Link href={`/group-orders/${order.groupOrder.id}`}>
                          <Package className="h-4 w-4 mr-2" />
                          View Group Order
                        </Link>
                      </Button>
                      <Button asChild className="flex-1 sm:flex-none">
                        <Link href={`/orders/${order.id}`}>
                          Track Order
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </MainContainer>
    </PageLayout>
  );
}