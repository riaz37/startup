"use client";

import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, XCircle, CreditCard, Lock } from "lucide-react";
import { useCreatePaymentIntent } from "@/hooks/api";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormContentProps {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function PaymentFormContent({ orderId, amount, onSuccess, onError }: PaymentFormContentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Handle payment submission logic here
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 1234 1234 1234"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              type="text"
              placeholder="MM/YY"
              required
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              type="text"
              placeholder="123"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="name">Cardholder Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-600">
          <Lock className="h-4 w-4 mr-2" />
          Secure payment powered by Stripe
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ₹${amount.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

interface PaymentFormProps {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onFailure?: (error: string) => void;
}

export function PaymentForm(props: PaymentFormProps) {
  const [error, setError] = useState<string | null>(null);

  const { 
    mutate: createPaymentIntent, 
    data: paymentIntent, 
    isPending, 
    error: mutationError 
  } = useCreatePaymentIntent();

  useEffect(() => {
    createPaymentIntent({
      orderId: props.orderId,
      amount: props.amount,
      currency: "INR"
    });
  }, [props.orderId, props.amount, createPaymentIntent]);

  useEffect(() => {
    if (mutationError) {
      setError("Failed to initialize payment");
    }
  }, [mutationError]);

  if (isPending) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Initializing payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!paymentIntent?.clientSecret) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>Payment initialization failed</AlertDescription>
      </Alert>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: paymentIntent.clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#0f172a",
            colorBackground: "#ffffff",
            colorText: "#0f172a",
            colorDanger: "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            spacingUnit: "4px",
            borderRadius: "8px",
          },
        },
      }}
    >
      <PaymentFormContent {...props} />
    </Elements>
  );
} 