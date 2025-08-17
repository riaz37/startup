import { PageLayout, MainContainer, PageHeader } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common";
import { 
  Package, 
  Clock,
  ArrowRight,
  Plus
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib";
import { prisma } from "@/lib";

interface PriorityOrder {
  id: string;
  orderNumber: string;
  product: {
    name: string;
    unit: string;
    unitSize: number;
    category: {
      name: string;
    };
  };
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  placedAt: Date;
  estimatedDelivery: Date | null;
  actualDelivery: Date | null;
  notes: string | null;
  delivery: {
    status: string;
  } | null;
}

export default async function PriorityOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <PageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Please sign in to view your priority orders.</p>
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </MainContainer>
      </PageLayout>
    );
  }

  // Fetch user's priority orders
  let priorityOrders: PriorityOrder[] = [];
  let error: Error | null = null;

  try {
    priorityOrders = await prisma.priorityOrder.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
        delivery: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to fetch priority orders');
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-blue-500">Confirmed</Badge>;
      case "PROCESSING":
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case "READY":
        return <Badge className="bg-green-500">Ready</Badge>;
      case "SHIPPED":
        return <Badge className="bg-purple-500">Shipped</Badge>;
      case "DELIVERED":
        return <Badge className="bg-green-600">Delivered</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <PageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading priority orders: {error.message}</p>
              <p className="text-gray-600">Please try refreshing the page or contact support if the problem persists.</p>
            </div>
          </div>
        </MainContainer>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <MainContainer>
        <PageHeader
          badge="🚀 Priority Orders"
          title="Your Priority Orders"
          highlightedWord="Priority Orders"
          description="View and track your priority orders with MRP pricing and faster delivery"
        />

        {/* Priority Orders List */}
        {priorityOrders.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No Priority Orders Yet"
            description="You haven't placed any priority orders yet. Priority orders are perfect when you need products faster than group orders."
            actionLabel="Browse Products"
            actionHref="/products"
          />
        ) : (
          <div className="space-y-4">
            {priorityOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Product Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{order.product.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {order.quantity} {order.product.unit} ({order.product.unitSize} {order.product.unit})
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Category: {order.product.category.name}
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Order Details:</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Placed: {new Date(order.placedAt).toLocaleDateString()}
                        </div>
                        {order.estimatedDelivery && (
                          <div className="text-sm text-muted-foreground">
                            Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                          </div>
                        )}
                        {order.actualDelivery && (
                          <div className="text-sm text-muted-foreground">
                            Delivered: {new Date(order.actualDelivery).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="space-y-3">
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {formatPrice(order.totalAmount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          MRP Price: {formatPrice(order.unitPrice)} per {order.product.unitSize} {order.product.unit}
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/priority-orders/${order.id}`}>
                            View Details
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <span className="font-medium">Notes:</span> {order.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </MainContainer>
    </PageLayout>
  );
} 