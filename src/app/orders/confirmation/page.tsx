import { redirect } from "next/navigation";
import { prisma, getCurrentUser } from "@/lib"
import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  MapPin, 
  Calendar,
  ArrowRight,
  Home,
  ShoppingCart
} from "lucide-react";
import Link from "next/link";

interface ConfirmationPageProps {
  searchParams: Promise<{
    success?: string;
    canceled?: string;
    orderId?: string;
  }>;
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { success, canceled, orderId } = await searchParams;
  const isSuccess = success === "true";
  const isCanceled = canceled === "true";

  let order = null;
  if (orderId) {
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        groupOrder: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        address: true,
        user: true,
      },
    });

    // Verify order belongs to user
    if (order && order.userId !== user.id) {
      redirect("/unauthorized");
    }
  }

  const getStatusIcon = () => {
    if (isSuccess) {
      return <CheckCircle className="h-16 w-16 text-green-500" />;
    }
    if (isCanceled) {
      return <XCircle className="h-16 w-16 text-red-500" />;
    }
    return <Package className="h-16 w-16 text-blue-500" />;
  };

  const getStatusTitle = () => {
    if (isSuccess) {
      return "Payment Successful!";
    }
    if (isCanceled) {
      return "Payment Cancelled";
    }
    return "Order Status";
  };

  const getStatusDescription = () => {
    if (isSuccess) {
      return "Your payment has been processed successfully. Your order is now confirmed!";
    }
    if (isCanceled) {
      return "Your payment was cancelled. You can try again or contact support if you need help.";
    }
    return "Check the status of your order below.";
  };

  const getStatusColor = () => {
    if (isSuccess) return "bg-green-100 text-green-800";
    if (isCanceled) return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <PageLayout>
      <MainContainer>
        <div className="max-w-2xl mx-auto text-center">
          {/* Status Icon */}
          <div className="mb-8">
            {getStatusIcon()}
          </div>

          {/* Status Title */}
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {getStatusTitle()}
          </h1>

          {/* Status Description */}
          <p className="text-xl text-muted-foreground mb-8">
            {getStatusDescription()}
          </p>

          {/* Order Details */}
          {order && (
            <Card className="card-sohozdaam mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Info */}
                <div className="flex items-center space-x-4">
                  {order.groupOrder.product.imageUrl ? (
                    <img
                      src={order.groupOrder.product.imageUrl}
                      alt={order.groupOrder.product.name}
                      className="h-16 w-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center border">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-foreground">
                      {order.groupOrder.product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Group Order #{order.groupOrder.batchNumber}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {order.groupOrder.product.category.name}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-left">
                    <span className="text-muted-foreground">Order Number:</span>
                    <p className="font-medium text-foreground">#{order.orderNumber}</p>
                  </div>
                  <div className="text-left">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <p className="font-medium text-foreground text-primary">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Delivery Address</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.address.addressLine1}
                    {order.address.addressLine2 && <>, {order.address.addressLine2}</>}
                    <br />
                    {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {isSuccess && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href={`/orders/${order?.id}`}>
                    <Package className="mr-2 h-4 w-4" />
                    Track Order
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="/orders">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View All Orders
                  </Link>
                </Button>
              </div>
            )}

            {isCanceled && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href={`/orders/${order?.id}/payment`}>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Try Payment Again
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="/orders">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View All Orders
                  </Link>
                </Button>
              </div>
            )}

            <div className="pt-4">
              <Button variant="ghost" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </MainContainer>
    </PageLayout>
  );
}