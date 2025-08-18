import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib";
import { prisma } from "@/lib/database";
import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Truck, 
  Home,
  User,
  CreditCard
} from "lucide-react";

interface OrderDetail {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  placedAt: string;
  confirmedAt: string | null;
  deliveredAt: string | null;
  groupOrder: {
    id: string;
    batchNumber: string;
    status: string;
    estimatedDelivery: string | null;
    actualDelivery: string | null;
    product: {
      id: string;
      name: string;
      unit: string;
      unitSize: number;
      imageUrl: string | null;
      category: {
        name: string;
      };
    };
  };
  address: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  delivery: {
    deliveryType: string;
    status: string;
    trackingNumber: string | null;
    estimatedDate: string | null;
    actualDate: string | null;
    pickupLocation: {
      name: string;
      address: string;
      contactPhone: string;
    } | null;
  } | null;
  statusSteps: Array<{
    key: string;
    label: string;
    description: string;
  }>;
  currentStepIndex: number;
  progress: number;
}

async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        groupOrder: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
                unitSize: true,
                imageUrl: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        address: true,
        items: true,
        delivery: {
          include: {
            pickupLocation: true,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    // Check if group order exists
    if (!order.groupOrder) {
      return null; // Cannot display order without group order
    }
    
    // Define status steps
    const statusSteps = [
      { key: 'placed', label: 'Order Placed', description: 'Your order has been placed successfully' },
      { key: 'confirmed', label: 'Order Confirmed', description: 'Payment received and order confirmed' },
      { key: 'processing', label: 'Processing', description: 'Order is being prepared for delivery' },
      { key: 'shipped', label: 'Shipped', description: 'Order has been shipped' },
      { key: 'delivered', label: 'Delivered', description: 'Order has been delivered' },
    ];

    // Calculate current step and progress
    let currentStepIndex = 0;
    switch (order.status) {
      case 'PENDING':
        currentStepIndex = 0;
        break;
      case 'CONFIRMED':
        currentStepIndex = 1;
        break;
      case 'PROCESSING':
        currentStepIndex = 2;
        break;
      case 'SHIPPED':
        currentStepIndex = 3;
        break;
      case 'DELIVERED':
        currentStepIndex = 4;
        break;
      default:
        currentStepIndex = 0;
    }

    const progress = ((currentStepIndex + 1) / statusSteps.length) * 100;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      placedAt: order.placedAt.toISOString(),
      confirmedAt: order.confirmedAt?.toISOString() || null,
      deliveredAt: order.deliveredAt?.toISOString() || null,
      groupOrder: {
        id: order.groupOrder.id,
        batchNumber: order.groupOrder.batchNumber,
        status: order.groupOrder.status,
        estimatedDelivery: order.groupOrder.estimatedDelivery?.toISOString() || null,
        actualDelivery: order.groupOrder.actualDelivery?.toISOString() || null,
        product: {
          id: order.groupOrder.product.id,
          name: order.groupOrder.product.name,
          unit: order.groupOrder.product.unit,
          unitSize: order.groupOrder.product.unitSize,
          imageUrl: order.groupOrder.product.imageUrl,
          category: {
            name: order.groupOrder.product.category.name,
          },
        },
      },
      address: {
        name: order.address.name,
        phone: order.address.phone,
        addressLine1: order.address.addressLine1,
        addressLine2: order.address.addressLine2,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pincode,
      },
      items: order.items.map((item) => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      delivery: order.delivery ? {
        deliveryType: order.delivery.deliveryType,
        status: order.delivery.status,
        trackingNumber: order.delivery.trackingNumber,
        estimatedDate: order.delivery.estimatedDate?.toISOString() || null,
        actualDate: order.delivery.actualDate?.toISOString() || null,
        pickupLocation: order.delivery.pickupLocation ? {
          name: order.delivery.pickupLocation.name,
          address: order.delivery.pickupLocation.address,
          contactPhone: order.delivery.pickupLocation.contactPhone,
        } : null,
      } : null,
      statusSteps,
      currentStepIndex,
      progress,
    };
  } catch (error) {
    console.error("Error fetching order detail:", error);
    return null;
  }
}

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;
  const order = await getOrderDetail(id);

  if (!order) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "COLLECTING":
        return { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock, label: "Collecting" };
      case "THRESHOLD_MET":
        return { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, label: "Threshold Met" };
      case "ORDERED":
        return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Package, label: "Ordered" };
      case "SHIPPED":
        return { color: "bg-purple-100 text-purple-800 border-purple-200", icon: Truck, label: "Shipped" };
      case "DELIVERED":
        return { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, label: "Delivered" };
      default:
        return { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Package, label: status.replace('_', ' ') };
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
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/orders"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>

        {/* Page Header */}
        <PageHeader
          badge={`Order #${order.orderNumber}`}
          title="Order Details"
          highlightedWord="Details"
          description={`Order placed on ${formatDate(order.placedAt)} • Group Order #${order.groupOrder.batchNumber}`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span>{Math.round(order.progress)}% Complete</span>
                  </div>
                  <Progress value={order.progress} className="h-3" />
                </div>

                {/* Status Steps */}
                <div className="space-y-4">
                  {order.statusSteps.map((step, index) => {
                    const isCompleted = index <= order.currentStepIndex;
                    const isCurrent = index === order.currentStepIndex;
                    
                    return (
                      <div key={step.key} className="flex items-start">
                        <div className="flex-shrink-0">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h3
                            className={`text-sm font-medium ${
                              isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {step.description}
                          </p>
                          {isCurrent && (
                            <div className="mt-2">
                              <Badge variant="secondary">Current Status</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  {order.groupOrder.product.imageUrl ? (
                    <img
                      src={order.groupOrder.product.imageUrl}
                      alt={order.groupOrder.product.name}
                      className="h-20 w-20 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-muted rounded-lg flex items-center justify-center border">
                      <Package className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-medium text-foreground">
                        {order.groupOrder.product.name}
                      </h3>
                      <Badge variant="outline" className="mt-1">
                        {order.groupOrder.product.category?.name}
                      </Badge>
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
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Order Status:</span>
                  <Badge className={`${getStatusConfig(order.status).color} border`}>
                    {getStatusConfig(order.status).label}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Payment Status:</span>
                  <Badge className={`${getPaymentStatusConfig(order.paymentStatus).color} border`}>
                    {getPaymentStatusConfig(order.paymentStatus).label}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Group Status:</span>
                  <Badge className={`${getStatusConfig(order.groupOrder.status).color} border`}>
                    {getStatusConfig(order.groupOrder.status).label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{order.address.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.address.phone}</p>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{order.address.addressLine1}</p>
                  {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                  <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                </div>
                
                {order.groupOrder.estimatedDelivery && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estimated Delivery:</span>
                      <span className="text-sm font-medium text-foreground">
                        {new Date(order.groupOrder.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}

                {order.groupOrder.actualDelivery && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Actual Delivery:</span>
                    <span className="text-sm font-medium text-foreground">
                      {new Date(order.groupOrder.actualDelivery).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Placed:</span>
                    <span className="font-medium text-foreground">
                      {new Date(order.placedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {order.confirmedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Confirmed:</span>
                      <span className="font-medium text-foreground">
                        {new Date(order.confirmedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {order.deliveredAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivered:</span>
                      <span className="font-medium text-foreground">
                        {new Date(order.deliveredAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href={`/group-orders/${order.groupOrder.id}`}>
                    View Group Order
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <Link href="/orders">
                    Back to Orders
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainContainer>
    </PageLayout>
  );
}