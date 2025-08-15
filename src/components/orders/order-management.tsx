"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  Home, 
  X, 
  Edit, 
  Trash2,
  Calendar,
  MapPin,
  User
} from "lucide-react";
import { useOrders, useAddresses, useUpdateOrder, useCancelOrder } from "@/hooks/api";
import { Order, Address } from "@/types";

interface OrderManagementProps {
  userId: string;
}

export function OrderManagement({ userId }: OrderManagementProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    quantity: "",
    addressId: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Use the new hooks
  const { data: orders, isLoading, refetch: refetchOrders } = useOrders();
  const { data: userAddresses, refetch: refetchAddresses } = useAddresses();
  const updateOrderMutation = useUpdateOrder();
  const cancelOrderMutation = useCancelOrder();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "PROCESSING":
        return <Package className="h-4 w-4 text-purple-600" />;
      case "SHIPPED":
        return <Truck className="h-4 w-4 text-indigo-600" />;
      case "DELIVERED":
        return <Home className="h-4 w-4 text-green-600" />;
      case "CANCELLED":
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary", text: "Pending" },
      CONFIRMED: { variant: "default", text: "Confirmed" },
      PROCESSING: { variant: "default", text: "Processing" },
      SHIPPED: { variant: "default", text: "Shipped" },
      DELIVERED: { variant: "default", text: "Delivered" },
      CANCELLED: { variant: "destructive", text: "Cancelled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline", text: status };
    
    return (
      <Badge variant={config.variant as "default" | "secondary" | "destructive" | "outline"}>
        {config.text}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary", text: "Pending" },
      PROCESSING: { variant: "default", text: "Processing" },
      COMPLETED: { variant: "default", text: "Paid" },
      FAILED: { variant: "destructive", text: "Failed" },
      REFUNDED: { variant: "outline", text: "Refunded" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline", text: status };
    
    return (
      <Badge variant={config.variant as "default" | "secondary" | "destructive" | "outline"}>
        {config.text}
      </Badge>
    );
  };

  const canEditOrder = (order: Order) => {
    return order.status === "PENDING" && order.paymentStatus !== "COMPLETED";
  };

  const canCancelOrder = (order: Order) => {
    return order.status !== "CANCELLED" && order.status !== "DELIVERED";
  };

  const openEditDialog = (order: Order) => {
    setSelectedOrder(order);
    setEditForm({
      quantity: order.items[0]?.quantity.toString() || "1",
      addressId: order.addressId,
      notes: order.notes || "",
    });
    setIsEditDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    updateOrderMutation.mutate({
      id: selectedOrder.id,
      data: {
        status: selectedOrder.status,
        deliveryAddress: userAddresses.find(addr => addr.id === editForm.addressId)?.addressLine1 || "",
      },
    }, {
      onSuccess: () => {
        setSuccess("Order updated successfully!");
        refetchOrders(); // Refresh orders
        setTimeout(() => {
          setIsEditDialogOpen(false);
          setSuccess(null);
        }, 2000);
      },
      onError: (error) => {
        setError(error.message || "Failed to update order");
      },
    });
  };

  const handleCancelOrder = async (order: Order) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    cancelOrderMutation.mutate(order.id, {
      onSuccess: () => {
        setSuccess("Order cancelled successfully!");
        refetchOrders(); // Refresh orders
        setTimeout(() => setSuccess(null), 3000);
      },
      onError: (error) => {
        setError(error.message || "Failed to cancel order");
        setTimeout(() => setError(null), 3000);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">You haven't placed any orders yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.placedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(order.status)}
                  {getPaymentStatusBadge(order.paymentStatus)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Order Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Product Details</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium">{order.groupOrder.product.name}</p>
                      <p className="text-sm text-gray-600">
                        {order.items[0]?.quantity} x {order.items[0]?.product.unitSize} {order.items[0]?.product.unit}
                      </p>
                      <p className="text-sm text-gray-600">
                        Unit Price: ₹{order.items[0]?.unitPrice}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Group Order</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Batch: {order.groupOrder.batchNumber}
                      </p>
                      <p className="text-sm text-blue-600">
                        Status: {order.groupOrder.status}
                      </p>
                      {order.groupOrder.estimatedDelivery && (
                        <p className="text-sm text-blue-600">
                          Est. Delivery: {new Date(order.groupOrder.estimatedDelivery).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address & Actions */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-800">{order.address.addressLine1}</p>
                      {order.address.addressLine2 && (
                        <p className="text-sm text-gray-800">{order.address.addressLine2}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {order.address.city}, {order.address.state} {order.address.pincode}
                      </p>
                      <p className="text-sm text-gray-600">
                        Contact: {order.address.contactPerson} - {order.address.contactPhone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Total</h4>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {canEditOrder(order) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(order)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    {canCancelOrder(order) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelOrder(order)}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                min="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="addressId">Delivery Address</Label>
              <Select
                value={editForm.addressId}
                onValueChange={(value) => setEditForm({ ...editForm, addressId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select address" />
                </SelectTrigger>
                <SelectContent>
                  {userAddresses.map((address) => (
                    <SelectItem key={address.id} value={address.id}>
                      {address.name} - {address.addressLine1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Any special instructions..."
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={updateOrderMutation.isPending}>
                {updateOrderMutation.isPending ? "Updating..." : "Update Order"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 