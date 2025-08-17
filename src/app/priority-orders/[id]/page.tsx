import { PageLayout, MainContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  MapPin, 
  Truck, 
  Clock,
  Calendar,
  User,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib";
import { prisma } from "@/lib";
import { Label } from "@/components/ui/label";

interface PriorityOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function PriorityOrderPage({ params }: PriorityOrderPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <PageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Please sign in to view your order.</p>
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </MainContainer>
      </PageLayout>
    );
  }

  // Fetch priority order
  let priorityOrder = null;
  let error: Error | null = null;

  try {
    priorityOrder = await prisma.priorityOrder.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
        address: true,
        delivery: {
          include: {
            pickupLocation: true,
          },
        },
        items: true,
      },
    });

    if (!priorityOrder) {
      error = new Error("Priority order not found");
    } else if (priorityOrder.userId !== user.id && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      error = new Error("Unauthorized access to this order");
    }
  } catch (err) {
    error = err instanceof Error ? err : new Error("Failed to fetch priority order");
  }

  if (error) {
    return (
      <PageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error: {error.message}</p>
              <Button asChild>
                <Link href="/priority-orders">Back to Orders</Link>
              </Button>
            </div>
          </div>
        </MainContainer>
      </PageLayout>
    );
  }

  // Ensure priorityOrder exists before proceeding
  if (!priorityOrder) {
    return (
      <PageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Priority order not found</p>
              <Button asChild>
                <Link href="/priority-orders">Back to Orders</Link>
              </Button>
            </div>
          </div>
        </MainContainer>
      </PageLayout>
    );
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

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      case "READY_FOR_PICKUP":
        return <Badge className="bg-green-500">Ready for Pickup</Badge>;
      case "OUT_FOR_DELIVERY":
        return <Badge className="bg-blue-500">Out for Delivery</Badge>;
      case "DELIVERED":
        return <Badge className="bg-green-600">Delivered</Badge>;
      case "FAILED":
        return <Badge className="bg-red-500">Failed</Badge>;
      case "RETURNED":
        return <Badge className="bg-orange-500">Returned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PageLayout>
      <MainContainer>
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href="/priority-orders" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Priority Orders
          </Link>
        </div>

        {/* Order Header */}
        <PageHeader
          badge="🚀 Priority Order"
          title={`Order ${priorityOrder.orderNumber}`}
          highlightedWord={priorityOrder.orderNumber}
          description={`Priority order for ${priorityOrder.product.name} with MRP pricing`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  {priorityOrder.product.imageUrl ? (
                    <img
                      src={priorityOrder.product.imageUrl}
                      alt={priorityOrder.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{priorityOrder.product.name}</h3>
                    <p className="text-muted-foreground mb-2">
                      {priorityOrder.product.unitSize} {priorityOrder.product.unit} • {priorityOrder.product.category.name}
                    </p>
                    {priorityOrder.product.description && (
                      <p className="text-sm text-muted-foreground">{priorityOrder.product.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Order Status</Label>
                    <div className="mt-1">{getStatusBadge(priorityOrder.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Payment Status</Label>
                    <div className="mt-1">
                      <Badge variant={priorityOrder.paymentStatus === "COMPLETED" ? "default" : "outline"}>
                        {priorityOrder.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Quantity</Label>
                    <div className="mt-1 font-medium">{priorityOrder.quantity} {priorityOrder.product.unit}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Unit Price</Label>
                    <div className="mt-1 font-medium">{formatPrice(priorityOrder.unitPrice)} (MRP)</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(priorityOrder.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Delivery Type</Label>
                    <div className="mt-1 capitalize">{priorityOrder.deliveryType.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Delivery Status</Label>
                    <div className="mt-1">
                      {priorityOrder.delivery ? getDeliveryStatusBadge(priorityOrder.delivery.status) : "Not set"}
                    </div>
                  </div>
                </div>

                {priorityOrder.estimatedDelivery && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Estimated Delivery: {new Date(priorityOrder.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {priorityOrder.actualDelivery && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Actual Delivery: {new Date(priorityOrder.actualDelivery).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {priorityOrder.delivery?.trackingNumber && (
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Tracking Number: {priorityOrder.delivery.trackingNumber}
                    </span>
                  </div>
                )}

                {priorityOrder.delivery?.pickupLocation && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Pickup Location</h4>
                    <p className="text-sm">{priorityOrder.delivery.pickupLocation.name}</p>
                    <p className="text-sm text-muted-foreground">{priorityOrder.delivery.pickupLocation.address}</p>
                    <p className="text-sm text-muted-foreground">{priorityOrder.delivery.pickupLocation.city}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {priorityOrder.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{priorityOrder.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <div className="mt-1 font-medium">{user.name}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <div className="mt-1">{user.email}</div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {priorityOrder.address.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{priorityOrder.address.pincode}</span>
                  </div>
                  <p className="text-sm">{priorityOrder.address.addressLine1}</p>
                  {priorityOrder.address.addressLine2 && (
                    <p className="text-sm">{priorityOrder.address.addressLine2}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {priorityOrder.address.city}, {priorityOrder.address.state}
                  </p>
                  {priorityOrder.address.landmark && (
                    <p className="text-sm text-muted-foreground">
                      Landmark: {priorityOrder.address.landmark}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Order Placed</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(priorityOrder.placedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {priorityOrder.confirmedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Order Confirmed</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(priorityOrder.confirmedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {priorityOrder.actualDelivery && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Delivered</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(priorityOrder.actualDelivery).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainContainer>
    </PageLayout>
  );
} 