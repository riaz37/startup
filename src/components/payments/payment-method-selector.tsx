"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Banknote, 
  Shield, 
  CheckCircle,
  AlertCircle 
} from "lucide-react";

export enum PaymentMethod {
  CARD = "CARD",
  UPI = "UPI",
  NETBANKING = "NETBANKING",
  WALLET = "WALLET",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY"
}

interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onMethodSelect: (method: PaymentMethod) => void;
  amount: number;
  onProceed: () => void;
  isLoading?: boolean;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    value: PaymentMethod.CARD,
    label: "Credit/Debit Card",
    description: "Pay securely with your card via Stripe",
    icon: <CreditCard className="h-5 w-5" />,
    badge: "Recommended"
  },
  {
    value: PaymentMethod.UPI,
    label: "UPI",
    description: "Pay using UPI apps like Google Pay, PhonePe",
    icon: <Banknote className="h-5 w-5" />,
    disabled: true
  },
  {
    value: PaymentMethod.NETBANKING,
    label: "Net Banking",
    description: "Pay directly from your bank account",
    icon: <Banknote className="h-5 w-5" />,
    disabled: true
  },
  {
    value: PaymentMethod.WALLET,
    label: "Digital Wallet",
    description: "Pay using digital wallets",
    icon: <Banknote className="h-5 w-5" />,
    disabled: true
  },
  {
    value: PaymentMethod.CASH_ON_DELIVERY,
    label: "Cash on Delivery",
    description: "Pay when you receive your order",
    icon: <Banknote className="h-5 w-5" />,
    badge: "Available"
  }
];

export function PaymentMethodSelector({
  selectedMethod,
  onMethodSelect,
  amount,
  onProceed,
  isLoading = false
}: PaymentMethodSelectorProps) {
  const [showCodInfo, setShowCodInfo] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const isCodSelected = selectedMethod === PaymentMethod.CASH_ON_DELIVERY;

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card className="card-sohozdaam">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Choose Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedMethod || ""}
            onValueChange={(value) => onMethodSelect(value as PaymentMethod)}
            className="space-y-4"
          >
            {paymentMethods.map((method) => (
              <div key={method.value} className="flex items-start space-x-3">
                <RadioGroupItem 
                  value={method.value} 
                  id={method.value} 
                  disabled={method.disabled}
                />
                <Label
                  htmlFor={method.value}
                  className={`flex-1 cursor-pointer ${method.disabled ? 'opacity-50' : ''}`}
                >
                  <div className={`p-4 border rounded-lg transition-colors ${
                    selectedMethod === method.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/80"
                  } ${method.disabled ? 'cursor-not-allowed' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-primary">
                          {method.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-foreground">
                              {method.label}
                            </span>
                            {method.badge && (
                              <Badge 
                                variant={method.badge === "Recommended" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {method.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {method.description}
                          </p>
                        </div>
                      </div>
                      {method.disabled && (
                        <Badge variant="outline" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Cash on Delivery Information */}
      {isCodSelected && (
        <Card className="card-sohozdaam border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              Cash on Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-amber-700 space-y-2">
              <p>• Payment will be collected when your order is delivered</p>
              <p>• Please have the exact amount ready</p>
              <p>• Delivery personnel will provide a receipt</p>
              <p>• No additional charges for cash on delivery</p>
            </div>
            
            <div className="pt-3 border-t border-amber-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-800 font-medium">Amount to Pay on Delivery:</span>
                <span className="text-amber-800 font-bold text-lg">
                  {formatPrice(amount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proceed Button */}
      <div className="pt-4">
        <Button
          onClick={onProceed}
          disabled={!selectedMethod || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              {isCodSelected ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Cash on Delivery Order
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 