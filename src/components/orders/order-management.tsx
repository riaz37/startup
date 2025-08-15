"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPrice } from "@/lib/utils";
import { 
  Package, 
  MapPin, 
  Calendar, 
  Edit, 
  X, 
  Eye, 
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  Home
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Address {
  id: string;
  type: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  placedAt: string;
  notes?: string;
  addressId: string;
  groupOrder: {
    batchNumber: string;
    status: string;
    estimatedDelivery?: string;
    product: {
      name: string;
      unit: string;
      unitSize: number;
      imageUrl?: string;
    };
  };
  address: Address;
  items: OrderItem[];
}

interface OrderManagementProps {
  userId: string;
}

export function OrderManagement({ userId }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    quantity: "",
    addressId: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchAddresses();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (response.ok) {
        const data = await response.json();
        setUserAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

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
      <Badge variant={config.variant as any}>
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
      <Badge variant={config.variant as any}>
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

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}/edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setSuccess("Order updated successfully!");
        await fetchOrders(); // Refresh orders
        setTimeout(() => {
          setIsEditDialogOpen(false);
          setSuccess(null);
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update order");
      }
    } catch (error) {
      setError("An error occurred while updating the order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "Cancelled by user" }),
      });

      if (response.ok) {
        setSuccess("Order cancelled successfully!");
        await fetchOrders(); // Refresh orders
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to cancel order");
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError("An error occurred while cancelling the order");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>No orders found</p>
            <p className="text-sm">Your orders will appear here once you place them.</p>
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
            <Package className="h-5 w-5 mr-2" />
            Order Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-medium">{order.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.groupOrder.product.name}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Payment</p>
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-medium">
                          {order.items[0]?.quantity || 1} {order.groupOrder.product.unit}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-muted-foreground">
                      <p>Placed: {new Date(order.placedAt).toLocaleDateString()}</p>
                      {order.groupOrder.estimatedDelivery && (
                        <p>Estimated Delivery: {new Date(order.groupOrder.estimatedDelivery).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {canEditOrder(order) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(order)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}

                    {canCancelOrder(order) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelOrder(order)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
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
                min={selectedOrder?.groupOrder.product.minOrderQty || 1}
                max={selectedOrder?.groupOrder.product.maxOrderQty || 100}
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
                      {address.name} - {address.addressLine1}, {address.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Any special instructions..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Order"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Product Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.groupOrder.product.name}</p>
                  <p><strong>Quantity:</strong> {selectedOrder.items[0]?.quantity || 1} {selectedOrder.groupOrder.product.unit}</p>
                  <p><strong>Unit Price:</strong> {formatPrice(selectedOrder.items[0]?.unitPrice || 0)}</p>
                  <p><strong>Total Amount:</strong> {formatPrice(selectedOrder.totalAmount)}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Order Information</h4>
                  <p><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                  <p><strong>Payment Status:</strong> {getPaymentStatusBadge(selectedOrder.paymentStatus)}</p>
                  <p><strong>Placed:</strong> {new Date(selectedOrder.placedAt).toLocaleDateString()}</p>
                  {selectedOrder.groupOrder.estimatedDelivery && (
                    <p><strong>Estimated Delivery:</strong> {new Date(selectedOrder.groupOrder.estimatedDelivery).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Delivery Address</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <p><strong>{selectedOrder.address.name}</strong></p>
                  <p>{selectedOrder.address.addressLine1}</p>
                  {selectedOrder.address.addressLine2 && <p>{selectedOrder.address.addressLine2}</p>}
                  <p>{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.pincode}</p>
                  {selectedOrder.address.landmark && <p>Landmark: {selectedOrder.address.landmark}</p>}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="bg-muted p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 