"use client";

import { useState, useEffect } from "react";
import { MainContainer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  Users,
  Target,
  DollarSign,
  Loader2,
  RefreshCw,
  Download,
  Clock,
  CheckCircle,
  Truck,
  Home,
  X,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  type: 'REGULAR' | 'PRIORITY' | 'GROUP';
  status: string;
  paymentStatus: string;
  totalAmount: number;
  placedAt: string;
  user: {
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
}

interface PriorityOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  product: {
    name: string;
    unit: string;
    unitSize: number;
  };
  quantity: number;
  deliveryType: string;
  estimatedDelivery?: string;
}

interface GroupOrder {
  id: string;
  batchNumber: string;
  status: string;
  currentAmount: number;
  targetQuantity: number;
  currentQuantity: number;
  pricePerUnit: number;
  expiresAt: string;
  estimatedDelivery: string | null;
  participantCount: number;
  product: {
    name: string;
    unit: string;
    unitSize: number;
  };
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [priorityOrders, setPriorityOrders] = useState<PriorityOrder[]>([]);
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setIsLoading(true);
      const [ordersRes, priorityOrdersRes, groupOrdersRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/priority-orders"),
        fetch("/api/admin/group-orders")
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

      if (priorityOrdersRes.ok) {
        const priorityData = await priorityOrdersRes.json();
        setPriorityOrders(priorityData.priorityOrders || []);
      }

      if (groupOrdersRes.ok) {
        const groupData = await groupOrdersRes.json();
        setGroupOrders(groupData.groupOrders || []);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch orders");
    } finally {
      setIsLoading(false);
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
      collecting: { color: "bg-orange-100 text-orange-800 border-orange-200", label: "Collecting" },
      threshold_met: { color: "bg-green-100 text-green-800 border-green-200", label: "Threshold Met" },
      processing: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "Processing" },
      shipped: { color: "bg-indigo-100 text-indigo-800 border-indigo-200", label: "Shipped" },
      delivered: { color: "bg-green-100 text-green-800 border-green-200", label: "Delivered" }
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
    const typeConfig: Record<string, { color: string; label: string; icon: any }> = {
      REGULAR: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Regular", icon: Package },
      PRIORITY: { color: "bg-purple-100 text-purple-800 border-purple-200", label: "Priority", icon: Clock },
      GROUP: { color: "bg-green-100 text-green-800 border-green-200", label: "Group", icon: Users }
    };

    const config = typeConfig[type] || { color: "bg-gray-100 text-gray-800 border-gray-200", label: type, icon: Package };
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
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
      day: "numeric"
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesType = typeFilter === "all" || order.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredPriorityOrders = priorityOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredGroupOrders = groupOrders.filter(order => {
    const matchesSearch = order.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <MainContainer className="max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </MainContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <MainContainer className="max-w-7xl">
        {/* Clean Header Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center mr-4">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold">Order Management</h1>
              <div className="flex items-center space-x-3 mt-1">
                <Badge variant="secondary" className="text-sm">
                  ADMIN
                </Badge>
                <span className="text-muted-foreground">
                  Comprehensive management of all order types
                </span>
              </div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage regular orders, priority orders, and group orders from one unified interface
          </p>
          
          {/* Action Buttons */}
          <div className="flex justify-center space-x-3 mt-6">
            <Button variant="outline" onClick={fetchAllOrders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="collecting">Collecting</SelectItem>
                    <SelectItem value="threshold_met">Threshold Met</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="REGULAR">Regular</SelectItem>
                    <SelectItem value="PRIORITY">Priority</SelectItem>
                    <SelectItem value="GROUP">Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Orders ({orders.length + priorityOrders.length + groupOrders.length})</TabsTrigger>
            <TabsTrigger value="regular">Regular ({orders.length})</TabsTrigger>
            <TabsTrigger value="priority">Priority ({priorityOrders.length})</TabsTrigger>
            <TabsTrigger value="group">Group ({groupOrders.length})</TabsTrigger>
          </TabsList>

          {/* All Orders Tab */}
          <TabsContent value="all" className="space-y-6">
            {/* Regular Orders */}
            {filteredOrders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Regular Orders ({filteredOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getTypeBadge(order.type)}
                            <div>
                              <h3 className="font-medium">#{order.orderNumber}</h3>
                              <p className="text-sm text-muted-foreground">
                                {order.user.name} • {order.user.email}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">{formatPrice(order.totalAmount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.placedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            {getStatusBadge(order.status)}
                            {getPaymentStatusBadge(order.paymentStatus)}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/orders/${order.id}/edit`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Priority Orders */}
            {filteredPriorityOrders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Priority Orders ({filteredPriorityOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPriorityOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getTypeBadge("PRIORITY")}
                            <div>
                              <h3 className="font-medium">#{order.orderNumber}</h3>
                              <p className="text-sm text-muted-foreground">
                                {order.user.name} • {order.user.email}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.product.name} • {order.quantity} {order.product.unit}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">{formatPrice(order.totalAmount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            {getStatusBadge(order.status)}
                            <Badge variant="outline">{order.deliveryType}</Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/priority-orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/priority-orders/${order.id}/edit`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Group Orders */}
            {filteredGroupOrders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Group Orders ({filteredGroupOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredGroupOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getTypeBadge("GROUP")}
                            <div>
                              <h3 className="font-medium">#{order.batchNumber}</h3>
                              <p className="text-sm text-muted-foreground">
                                {order.product.name} • {order.product.unitSize} {order.product.unit}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.participantCount} participants • {order.currentQuantity}/{order.targetQuantity} {order.product.unit}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">{formatPrice(order.currentAmount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            {getStatusBadge(order.status)}
                            <Badge variant="outline">
                              {order.currentQuantity}/{order.targetQuantity}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/group-orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/group-orders/${order.id}/edit`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {filteredOrders.length === 0 && filteredPriorityOrders.length === 0 && filteredGroupOrders.length === 0 && (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No orders found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Regular Orders Tab */}
          <TabsContent value="regular">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Regular Orders ({filteredOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredOrders.length > 0 ? (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getTypeBadge(order.type)}
                            <div>
                              <h3 className="font-medium">#{order.orderNumber}</h3>
                              <p className="text-sm text-muted-foreground">
                                {order.user.name} • {order.user.email}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">{formatPrice(order.totalAmount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.placedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            {getStatusBadge(order.status)}
                            {getPaymentStatusBadge(order.paymentStatus)}
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/orders/${order.id}/edit`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No regular orders found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Priority Orders Tab */}
          <TabsContent value="priority">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Priority Orders ({filteredPriorityOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPriorityOrders.length > 0 ? (
                  <div className="space-y-4">
                    {filteredPriorityOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getTypeBadge("PRIORITY")}
                            <div>
                              <h3 className="font-medium">#{order.orderNumber}</h3>
                              <p className="text-sm text-muted-foreground">
                                {order.user.name} • {order.user.email}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.product.name} • {order.quantity} {order.product.unit}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">{formatPrice(order.totalAmount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            {getStatusBadge(order.status)}
                            <Badge variant="outline">{order.deliveryType}</Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/priority-orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/priority-orders/${order.id}/edit`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No priority orders found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Group Orders Tab */}
          <TabsContent value="group">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Group Orders ({filteredGroupOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredGroupOrders.length > 0 ? (
                  <div className="space-y-4">
                    {filteredGroupOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getTypeBadge("GROUP")}
                            <div>
                              <h3 className="font-medium">#{order.batchNumber}</h3>
                              <p className="text-sm text-muted-foreground">
                                {order.product.name} • {order.product.unitSize} {order.product.unit}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.participantCount} participants • {order.currentQuantity}/{order.targetQuantity} {order.product.unit}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">{formatPrice(order.currentAmount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            {getStatusBadge(order.status)}
                            <Badge variant="outline">
                              {order.currentQuantity}/{order.targetQuantity}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/group-orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/group-orders/${order.id}/edit`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No group orders found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </MainContainer>
    </div>
  );
} 