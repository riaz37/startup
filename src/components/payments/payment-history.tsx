"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import { CreditCard, Eye, Calendar, DollarSign } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  gatewayProvider: string;
  status: string;
  processedAt: string | null;
  failureReason: string | null;
  order: {
    id: string;
    orderNumber: string;
    groupOrder: {
      product: {
        name: string;
      };
    };
  };
}

interface PaymentHistoryProps {
  userId: string;
}

export function PaymentHistory({ userId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [userId]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/payments?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary", text: "Pending" },
      PROCESSING: { variant: "secondary", text: "Processing" },
      COMPLETED: { variant: "default", text: "Completed" },
      FAILED: { variant: "destructive", text: "Failed" },
      REFUNDED: { variant: "outline", text: "Refunded" },
      PARTIALLY_REFUNDED: { variant: "outline", text: "Partially Refunded" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline", text: status };
    
    return (
      <Badge variant={config.variant as any}>
        {config.text}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "stripe":
        return <CreditCard className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading payments...</div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>No payments found</p>
            <p className="text-sm">Your payment history will appear here once you make payments.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getPaymentMethodIcon(payment.paymentMethod)}
                    <span className="font-medium">
                      {formatPrice(payment.amount)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">{payment.order.groupOrder.product.name}</p>
                    <p className="text-xs">Order: {payment.order.orderNumber}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusBadge(payment.status)}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Amount</p>
                  <p className="text-lg font-bold">
                    {formatPrice(selectedPayment.amount)}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-muted-foreground">Status</p>
                  {getStatusBadge(selectedPayment.status)}
                </div>
                
                <div>
                  <p className="font-medium text-muted-foreground">Payment Method</p>
                  <p className="flex items-center space-x-2">
                    {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                    <span className="capitalize">{selectedPayment.paymentMethod}</span>
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-muted-foreground">Provider</p>
                  <p className="capitalize">{selectedPayment.gatewayProvider}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Order Number</p>
                  <p>{selectedPayment.order.orderNumber}</p>
                </div>
                
                <div>
                  <p className="font-medium text-muted-foreground">Product</p>
                  <p>{selectedPayment.order.groupOrder.product.name}</p>
                </div>
                
                <div>
                  <p className="font-medium text-muted-foreground">Processed At</p>
                  <p className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(selectedPayment.processedAt)}</span>
                  </p>
                </div>
                
                {selectedPayment.failureReason && (
                  <div>
                    <p className="font-medium text-muted-foreground">Failure Reason</p>
                    <p className="text-red-600">{selectedPayment.failureReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 