"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";
import { 
  CreditCard, 
  DollarSign, 
  Eye, 
  Download, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { usePaymentsByOrder } from "@/hooks/api";

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    orderNumber: string;
    productName: string;
  };
}

interface PaymentHistoryProps {
  userId: string;
}

export function PaymentHistory({ userId }: PaymentHistoryProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Use the new hook - we'll need to get payments for all orders
  // For now, let's use a mock approach since we don't have a direct hook for all user payments
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration - in real app, you'd use a hook like useUserPayments
  useState(() => {
    // This would be replaced with actual hook usage
    setPayments([]);
  });

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
      <Badge variant={config.variant as "default" | "secondary" | "destructive" | "outline"}>
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

  const openViewDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
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
          <div className="h-[400px] overflow-y-auto">
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {payment.order?.productName || `Order ${payment.orderId}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {payment.order?.orderNumber || payment.transactionId}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {formatPrice(payment.amount)}
                      </p>
                      {getStatusBadge(payment.status)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openViewDialog(payment)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-600">Amount</p>
                  <p className="font-semibold">{formatPrice(selectedPayment.amount)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Status</p>
                  {getStatusBadge(selectedPayment.status)}
                </div>
                <div>
                  <p className="font-medium text-gray-600">Method</p>
                  <p className="flex items-center">
                    {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                    <span className="ml-2 capitalize">{selectedPayment.paymentMethod}</span>
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Transaction ID</p>
                  <p className="font-mono text-xs">{selectedPayment.transactionId}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span>{formatDate(selectedPayment.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Updated</span>
                  <span>{formatDate(selectedPayment.updatedAt)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 