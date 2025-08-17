"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Package, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Truck,
  MapPin
} from "lucide-react";

interface PriorityOrder {
  id: string;
  orderNumber: string;
  product: {
    name: string;
    unit: string;
    unitSize: number;
  };
  user: {
    name: string;
    email: string;
  };
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  deliveryType: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  createdAt: string;
  address: {
    street: string;
    city: string;
    pincode: string;
  };
}

interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
}

export function PriorityOrdersManagementPanel() {
  const [priorityOrders, setPriorityOrders] = useState<PriorityOrder[]>([]);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<PriorityOrder | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPriorityOrders();
    fetchPickupLocations();
  }, []);

  const fetchPriorityOrders = async () => {
    try {
      const response = await fetch('/api/priority-orders');
      if (response.ok) {
        const data = await response.json();
        setPriorityOrders(data.priorityOrders);
      }
    } catch (error) {
      console.error('Error fetching priority orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPickupLocations = async () => {
    // Mock data - in real app, fetch from API
    const mockLocations: PickupLocation[] = [
      {
        id: '1',
        name: 'Central Mall, Ground Floor',
        address: '123 Main Street',
        city: 'Dhaka',
      },
      {
        id: '2',
        name: 'Downtown Plaza, Level 2',
        address: '456 Business Avenue',
        city: 'Dhaka',
      },
    ];
    setPickupLocations(mockLocations);
  };

  const handleStatusUpdate = async (orderId: string, status: string, additionalData?: any) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/priority-orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          ...additionalData,
        }),
      });

      if (response.ok) {
        await fetchPriorityOrders();
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating priority order:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-blue-500">Confirmed</Badge>;
      case "PROCESSING":
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case "READY":
        return <Badge className="bg-green-500">Ready</Badge>;
      case "SHIPPED":
        return <Badge className="bg-purple-500">Shipped</Badge>;
      case "DELIVERED":
        return <Badge className="bg-green-600">Delivered</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActionButton = (order: PriorityOrder) => {
    switch (order.status) {
      case "PENDING":
        return (
          <Button
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => handleStatusUpdate(order.id, "CONFIRMED")}
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
          >
            Start Processing
          </Button>
        );
      case "PROCESSING":
        return (
          <Button
            size="sm"
            className="bg-green-500 hover:bg-green-600"
            onClick={() => handleStatusUpdate(order.id, "READY")}
          >
            Mark Ready
          </Button>
        );
      case "READY":
        return (
          <Button
            size="sm"
            className="bg-purple-500 hover:bg-purple-600"
            onClick={() => handleStatusUpdate(order.id, "SHIPPED")}
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
          >
            Mark Delivered
          </Button>
        );
      default:
        return null;
    }
  };

  const filteredOrders = priorityOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Priority Orders Management</h2>
          <p className="text-muted-foreground">
            Manage priority orders with MRP pricing and delivery scheduling
          </p>
        </div>
        <Button onClick={fetchPriorityOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by order number, product, or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="READY">Ready</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Priority Orders Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Priority orders will appear here once customers place them."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{order.product.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Quantity: {order.quantity} {order.product.unit} ({order.product.unitSize} {order.product.unit})
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Unit Price: {formatPrice(order.unitPrice)} (MRP)
                      </div>
                      <div className="font-semibold text-lg text-green-600">
                        Total: {formatPrice(order.totalAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Customer & Delivery Info */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Customer:</span>
                        <span>{order.user.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{order.user.email}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Delivery:</span>
                        <span className="capitalize">{order.deliveryType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {order.address.street}, {order.address.city} - {order.address.pincode}
                        </span>
                      </div>
                    </div>
                    {order.estimatedDelivery && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Timeline */}
                  <div className="space-y-3">
                    <div className="flex flex-col space-y-2">
                      {getActionButton(order)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Manage Delivery
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <span className="font-medium">Notes:</span> {order.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delivery Management Modal */}
      {selectedOrder && (
        <Card className="fixed inset-4 z-50 overflow-y-auto bg-background border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Manage Delivery - {selectedOrder.orderNumber}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimated-delivery">Estimated Delivery Date</Label>
                <Input
                  id="estimated-delivery"
                  type="date"
                  defaultValue={selectedOrder.estimatedDelivery ? selectedOrder.estimatedDelivery.split('T')[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleStatusUpdate(selectedOrder.id, selectedOrder.status, {
                        estimatedDelivery: e.target.value
                      });
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="delivery-type">Delivery Type</Label>
                <Select
                  defaultValue={selectedOrder.deliveryType}
                  onValueChange={(value) => {
                    handleStatusUpdate(selectedOrder.id, selectedOrder.status, {
                      deliveryType: value
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOME_DELIVERY">Home Delivery</SelectItem>
                    <SelectItem value="PICKUP">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 