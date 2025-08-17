"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentMethodSelector, PaymentMethod } from "./payment-method-selector";
import { PaymentForm } from "./payment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface CashOnDeliveryHandlerProps {
  orderId: string;
  amount: number;
  orderNumber: string;
}

export function CashOnDeliveryHandler({ orderId, amount, orderNumber }: CashOnDeliveryHandlerProps) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCodConfirmed, setIsCodConfirmed] = useState(false);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handleProceed = async () => {
    if (!selectedMethod) return;

    if (selectedMethod === PaymentMethod.CASH_ON_DELIVERY) {
      await handleCashOnDelivery();
    }
    // For other payment methods, the PaymentForm will handle them
  };

  const handleCashOnDelivery = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/cash-on-delivery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        setIsCodConfirmed(true);
        // Redirect to confirmation page after a short delay
        setTimeout(() => {
          router.push(`/orders/confirmation?orderId=${orderId}&success=true&method=cod`);
        }, 2000);
      } else {
        setError(result.error || "Failed to confirm cash on delivery order");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Show success message for COD confirmation
  if (isCodConfirmed) {
    return (
      <Card className="card-sohozdaam border-green-200 bg-green-50/50">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Cash on Delivery Order Confirmed!
          </h3>
          <p className="text-green-700 mb-4">
            Your order has been confirmed. You will pay {new Intl.NumberFormat("en-BD", {
              style: "currency",
              currency: "BDT",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(amount)} when your order is delivered.
          </p>
          <p className="text-sm text-green-600">
            Redirecting to order confirmation...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selector */}
      <PaymentMethodSelector
        selectedMethod={selectedMethod}
        onMethodSelect={handleMethodSelect}
        amount={amount}
        onProceed={handleProceed}
        isLoading={isProcessing}
      />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Payment Forms */}
      {selectedMethod && selectedMethod !== PaymentMethod.CASH_ON_DELIVERY && (
        <Card className="card-sohozdaam">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">
                {selectedMethod === PaymentMethod.CARD && "💳"}
                {selectedMethod === PaymentMethod.UPI && "📱"}
                {selectedMethod === PaymentMethod.NETBANKING && "🏦"}
                {selectedMethod === PaymentMethod.WALLET && "👛"}
              </span>
              {selectedMethod === PaymentMethod.CARD && "Card Payment"}
              {selectedMethod === PaymentMethod.UPI && "UPI Payment"}
              {selectedMethod === PaymentMethod.NETBANKING && "Net Banking"}
              {selectedMethod === PaymentMethod.WALLET && "Digital Wallet"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMethod === PaymentMethod.CARD && (
              <PaymentForm
                orderId={orderId}
                amount={amount}
                onSuccess={() => {
                  router.push(`/orders/confirmation?orderId=${orderId}&success=true`);
                }}
                onFailure={(error) => setError(error)}
              />
            )}
            
            {(selectedMethod === PaymentMethod.UPI || 
              selectedMethod === PaymentMethod.NETBANKING || 
              selectedMethod === PaymentMethod.WALLET) && (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <p className="text-lg font-medium mb-2">Coming Soon!</p>
                  <p>This payment method will be available soon.</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMethod(null)}
                >
                  Choose Different Method
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing State */}
      {isProcessing && (
        <Card className="card-sohozdaam">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Processing your cash on delivery order...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 