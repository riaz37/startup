import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navigation } from "@/components/home/navigation";
import { Footer } from "@/components/home/footer";
import { MainContainer } from "@/components/layout";
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
  searchParams: {
    success?: string;
    canceled?: string;
    orderId?: string;
  };
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { success, canceled, orderId } = searchParams;
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

  const getStatusText = () => {
    if (isSuccess) return "Confirmed";
    if (isCanceled) return "Cancelled";
    return order?.status || "Pending";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navigation user={user} />

      <MainContainer>
        <div className="max-w-2xl mx-auto text-center">
          {/* Status Icon and Title */}
          <div className="mb-8">
            {getStatusIcon()}
            <h1 className="text-4xl font-bold mt-6 mb-4">
              {getStatusTitle()}
            </h1>
            <p className="text-xl text-muted-foreground">
              {getStatusDescription()}
            </p>
          </div>

          {/* Order Details Card */}
          {order && (
            <Card className="card-sohozdaam mb-8">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Status */}
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor()}>
                    {getStatusText()}
                  </Badge>
                </div>

                <Separator />

                {/* Product Info */}
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <h4 className="font-medium">{order.groupOrder.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.groupOrder.product.unitSize} {order.groupOrder.product.unit}
                    </p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <h4 className="font-medium">Delivery Address</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.address.addressLine1}
                      {order.address.addressLine2 && (
                        <>, {order.address.addressLine2}</>
                      )}
                      <br />
                      {order.address.city}, {order.address.state} {order.address.pincode}
                    </p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-left">
                    <span className="text-muted-foreground">Order Number:</span>
                    <p className="font-medium">{order.orderNumber}</p>
                  </div>
                  <div className="text-left">
                    <span className="text-muted-foreground">Order Date:</span>
                    <p className="font-medium">
                      {new Date(order.placedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <p className="font-medium text-lg text-primary">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <p className="font-medium">
                      {order.paymentStatus === "COMPLETED" ? "Paid" : "Pending"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="flex-1 sm:flex-none">
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="flex-1 sm:flex-none">
              <Link href="/orders">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Orders
              </Link>
            </Button>

            {isCanceled && (
              <Button variant="outline" asChild className="flex-1 sm:flex-none">
                <Link href={`/orders/${orderId}/payment`}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Try Again
                </Link>
              </Button>
            )}
          </div>

          {/* Additional Information */}
          {isSuccess && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li>• You'll receive an email confirmation shortly</li>
                <li>• We'll notify you when your order is ready for pickup/delivery</li>
                <li>• Track your order status in your dashboard</li>
                <li>• Contact support if you have any questions</li>
              </ul>
            </div>
          )}

          {isCanceled && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">
                Need help?
              </h3>
              <p className="text-sm text-blue-700">
                If you're experiencing issues with payment or have questions, 
                please contact our support team. We're here to help!
              </p>
            </div>
          )}
        </div>
      </MainContainer>

      <Footer />
    </div>
  );
}