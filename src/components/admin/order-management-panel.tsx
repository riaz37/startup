"use client";

import { useState, useEffect } from "react";
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
  User,
  DollarSign,
  CreditCard,
  AlertCircle,
  Save,
  Loader2
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  type: 'REGULAR' | 'PRIORITY' | 'GROUP';
  status: string;
  paymentStatus: string;
  totalAmount: number;
  placedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  product?: {
    name: string;
    unit: string;
    unitSize: number;
  };
  quantity?: number;
  deliveryType?: string;
  estimatedDelivery?: string;
  address?: {
    street: string;
    city: string;
    pincode: string;
  };
  notes?: string;
}

interface OrderManagementPanelProps {
  orderId?: string;
  onOrderUpdate?: (orderId: string, updates: Partial<Order>) => void;
}

export function OrderManagementPanel({ orderId, onOrderUpdate }: OrderManagementPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    paymentStatus: "",
    notes: "",
    estimatedDelivery: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    } else {
      fetchOrders();
    }
  }, [orderId]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      setError('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrder = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${id}`);
      if (response.ok) {
        const order = await response.json();
        setSelectedOrder(order);
        setEditForm({
          status: order.status,
          paymentStatus: order.paymentStatus,
          notes: order.notes || "",
          estimatedDelivery: order.estimatedDelivery || "",
        });
      }
    } catch (error) {
      setError('Failed to fetch order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setSuccess(`Order status updated to ${status}`);
        if (onOrderUpdate) {
          onOrderUpdate(orderId, { status });
        }
        // Refresh orders
        if (orderId) {
          fetchOrder(orderId);
        } else {
          fetchOrders();
        }
      } else {
        setError('Failed to update order status');
      }
    } catch (error) {
      setError('Failed to update order status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setSuccess('Order updated successfully');
        setIsEditDialogOpen(false);
        if (onOrderUpdate) {
          onOrderUpdate(selectedOrder.id, editForm);
        }
        // Refresh order
        fetchOrder(selectedOrder.id);
      } else {
        setError('Failed to update order');
      }
    } catch (error) {
      setError('Failed to update order');
    } finally {
      setIsLoading(false);
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
    const statusConfig: Record<string, { color: string; label: string }> = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
      CONFIRMED: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Confirmed" },
      PROCESSING: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "Processing" },
      SHIPPED: { color: "bg-indigo-100 text-indigo-800 border-indigo-200", label: "Shipped" },
      DELIVERED: { color: "bg-green-100 text-green-800 border-green-200", label: "Delivered" },
      CANCELLED: { color: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
    };

    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800 border-gray-200", label: status };
    
    return (
      <Badge className={`${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const paymentConfig: Record<string, { color: string; label: string }> = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
      COMPLETED: { color: "bg-green-100 text-green-800 border-green-200", label: "Completed" },
      FAILED: { color: "bg-red-100 text-red-800 border-red-200", label: "Failed" },
      REFUNDED: { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Refunded" }
    };

    const config = paymentConfig[status] || { color: "bg-gray-100 text-gray-800 border-gray-200", label: status };
    
    return (
      <Badge className={`${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { color: string; label: string }> = {
      REGULAR: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Regular" },
      PRIORITY: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "Priority" },
      GROUP: { color: "bg-green-100 text-green-800 border-green-200", label: "Group" }
    };

    const config = typeConfig[type] || { color: "bg-gray-100 text-gray-800 border-gray-200", label: type };
    
    return (
      <Badge className={`${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getActionButton = (order: Order) => {
    switch (order.status) {
      case "PENDING":
        return (
          <Button
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => handleStatusUpdate(order.id, "CONFIRMED")}
            disabled={isLoading}
          >
            Confirm Order
          </Button>
        );
      case "CONFIRMED":
        return (
          <Button
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600"
            onClick={() => handleStatusUpdate(order.id, "PROCESSING")}
            disabled={isLoading}
          >
            Start Processing
          </Button>
        );
      case "PROCESSING":
        return (
          <Button
            size="sm"
            className="bg-green-500 hover:bg-green-600"
            onClick={() => handleStatusUpdate(order.id, "SHIPPED")}
            disabled={isLoading}
          >
            Mark Shipped
          </Button>
        );
      case "SHIPPED":
        return (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleStatusUpdate(order.id, "DELIVERED")}
            disabled={isLoading}
          >
            Mark Delivered
          </Button>
        );
      default:
        return null;
    }
  };

  if (isLoading && !orders.length) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (orderId && selectedOrder) {
    // Single order view
    return (
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                {getStatusIcon(selectedOrder.status)}
                <span className="ml-2">Order #{selectedOrder.orderNumber}</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                {getStatusBadge(selectedOrder.status)}
                {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                {getTypeBadge(selectedOrder.type)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Order Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Date:</span>
                    <span>{formatDate(selectedOrder.placedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-semibold">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                  {selectedOrder.quantity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span>{selectedOrder.quantity}</span>
                    </div>
                  )}
                  {selectedOrder.deliveryType && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Type:</span>
                      <span>{selectedOrder.deliveryType}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{selectedOrder.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{selectedOrder.user.email}</span>
                  </div>
                  {selectedOrder.address && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="text-right">
                        {selectedOrder.address.street}, {selectedOrder.address.city} {selectedOrder.address.pincode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Information */}
            {selectedOrder.product && (
              <div>
                <h3 className="font-semibold mb-3">Product Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product:</span>
                    <span>{selectedOrder.product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit:</span>
                    <span>{selectedOrder.product.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit Size:</span>
                    <span>{selectedOrder.product.unitSize}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedOrder.notes && (
              <div>
                <h3 className="font-semibold mb-3">Notes</h3>
                <p className="text-muted-foreground bg-muted p-3 rounded-md">
                  {selectedOrder.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex space-x-2">
                {getActionButton(selectedOrder)}
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(true)}
                  disabled={isLoading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Order
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated: {formatDate(selectedOrder.placedAt)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={editForm.paymentStatus} onValueChange={(value) => setEditForm({ ...editForm, paymentStatus: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                <Input
                  type="datetime-local"
                  value={editForm.estimatedDelivery}
                  onChange={(e) => setEditForm({ ...editForm, estimatedDelivery: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Add order notes..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Orders list view
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
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
                      Placed on {formatDate(order.placedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(order.status)}
                  {getPaymentStatusBadge(order.paymentStatus)}
                  {getTypeBadge(order.type)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div>
                  <h4 className="font-medium mb-2">Customer</h4>
                  <div className="space-y-1">
                    <p className="text-sm">{order.user.name}</p>
                    <p className="text-sm text-muted-foreground">{order.user.email}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Order Details</h4>
                  <div className="space-y-1">
                    <p className="text-sm">Total: {formatPrice(order.totalAmount)}</p>
                    {order.quantity && (
                      <p className="text-sm text-muted-foreground">Qty: {order.quantity}</p>
                    )}
                    {order.deliveryType && (
                      <p className="text-sm text-muted-foreground">Delivery: {order.deliveryType}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Actions</h4>
                  <div className="space-y-2">
                    {getActionButton(order)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(order);
                        setEditForm({
                          status: order.status,
                          paymentStatus: order.paymentStatus,
                          notes: order.notes || "",
                          estimatedDelivery: order.estimatedDelivery || "",
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              There are no orders to display at the moment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 