import { getCurrentUser, prisma } from "@/lib";
import { redirect } from "next/navigation";
import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { PaymentForm } from "@/components/payments/payment-form";
import { PaymentMethodSelector, PaymentMethod } from "@/components/payments/payment-method-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { 
  CreditCard, 
  Package, 
  MapPin, 
  Calendar,
  User,
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { CashOnDeliveryHandler } from "@/components/payments/cash-on-delivery-handler";

interface PaymentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  // Fetch order details
  const order = await prisma.order.findUnique({
    where: { id: id },
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

  if (!order) {
    redirect("/orders");
  }

  // Verify order belongs to user
  if (order.userId !== user.id) {
    redirect("/unauthorized");
  }

  // Check if order is cancelled
  if (order.status === "CANCELLED") {
    redirect(`/orders/${order.id}`);
  }

  // Check if order is already paid
  if (order.paymentStatus === "COMPLETED" || order.paymentStatus === "CASH_ON_DELIVERY") {
    redirect(`/orders/confirmation?orderId=${order.id}&success=true`);
  }

  return (
    <PageLayout>
      <MainContainer>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <PageHeader
            badge="💳 Payment"
            title="Complete Your"
            highlightedWord="Payment"
            description="Choose your preferred payment method to complete your order."
          />

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Method Selection and Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method Selector */}
              <PaymentMethodSelector
                selectedMethod={null}
                onMethodSelect={() => {}} // Will be handled by client component
                amount={order.totalAmount}
                onProceed={() => {}} // Will be handled by client component
              />

              {/* Payment Forms Container */}
              <CashOnDeliveryHandler
                orderId={order.id}
                amount={order.totalAmount}
                orderNumber={order.orderNumber}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="card-sohozdaam">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product Info */}
                  <div className="flex items-center space-x-3">
                    {order.groupOrder.product.imageUrl ? (
                      <img
                        src={order.groupOrder.product.imageUrl}
                        alt={order.groupOrder.product.name}
                        className="h-12 w-12 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center border">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground text-sm">
                        {order.groupOrder.product.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Group Order #{order.groupOrder.batchNumber}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {order.groupOrder.product.category.name}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Number:</span>
                      <span className="font-medium">#{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <Badge variant="outline" className="text-xs">
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit Price:</span>
                      <span className="font-medium">
                        {formatPrice(order.groupOrder.pricePerUnit)}/{order.groupOrder.product.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">1 {order.groupOrder.product.unit}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount:</span>
                      <span className="text-primary">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card className="card-sohozdaam">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Delivery Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{order.address.name}</span>
                    </div>
                    <p className="text-muted-foreground">
                      {order.address.addressLine1}
                      {order.address.addressLine2 && <>, {order.address.addressLine2}</>}
                    </p>
                    <p className="text-muted-foreground">
                      {order.address.city}, {order.address.state} - {order.address.pincode}
                    </p>
                    <p className="text-muted-foreground">Phone: {order.address.phone}</p>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Estimated Delivery:</span>
                    </div>
                    <p className="font-medium">
                      {order.groupOrder.estimatedDelivery 
                        ? new Date(order.groupOrder.estimatedDelivery).toLocaleDateString()
                        : 'TBD'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="card-sohozdaam border-green-200 bg-green-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Secure Payment</p>
                      <p>Your payment information is encrypted and secure. We never store your card details.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainContainer>
    </PageLayout>
  );
} 