import { getCurrentUser, prisma } from "@/lib";
import { redirect } from "next/navigation";
import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { PaymentForm } from "@/components/payments/payment-form";
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
  CheckCircle
} from "lucide-react";

interface PaymentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch order details
  const order = await prisma.order.findUnique({
    where: { id },
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

  // Check if order is already paid
  if (order.paymentStatus === "COMPLETED") {
    redirect(`/orders/${order.id}`);
  }

  // Check if order is cancelled
  if (order.status === "CANCELLED") {
    redirect(`/orders/${order.id}`);
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
            description="Secure payment powered by Stripe. Your payment information is encrypted and secure."
          />

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card className="card-sohozdaam">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-6 w-6 text-primary mr-2" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentForm
                    orderId={order.id}
                    amount={order.totalAmount}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="card-sohozdaam">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product Info */}
                  <div className="flex items-start space-x-3">
                    <Package className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium">{order.groupOrder.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {order.groupOrder.product.unitSize} {order.groupOrder.product.unit}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {order.groupOrder.batchNumber}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Delivery Address */}
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
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

                  <Separator />

                  {/* Order Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Order Number:</span>
                      <span className="font-medium">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Order Date:</span>
                      <span className="font-medium">
                        {new Date(order.placedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Payment Method:</span>
                      <span className="font-medium">Credit/Debit Card</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="text-center pt-4">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(order.totalAmount)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Amount
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="card-sohozdaam">
                <CardContent className="pt-6">
                  <div className="text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center mb-2">
                      <Shield className="h-4 w-4 text-green-500 mr-2" />
                      <span>Secure Payment</span>
                    </div>
                    <p>
                      Your payment information is encrypted and secure. 
                      We never store your card details.
                    </p>
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