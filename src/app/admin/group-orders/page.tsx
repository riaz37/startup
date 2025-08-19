"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminNavigation } from "@/components/admin";
import { MainContainer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
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
  Loader2
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface GroupOrder {
  id: string;
  batchNumber: string;
  minThreshold: number;
  currentAmount: number;
  targetQuantity: number;
  currentQuantity: number;
  pricePerUnit: number;
  status: string;
  expiresAt: string;
  estimatedDelivery: string | null;
  progressPercentage: number;
  participantCount: number;
  timeRemaining: number;
  product: {
    id: string;
    name: string;
    unit: string;
    unitSize: number;
  };
  createdAt: string;
}

export default function AdminGroupOrdersPage() {
  const router = useRouter();
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<GroupOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  useEffect(() => {
    fetchGroupOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [groupOrders, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchGroupOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/group-orders");
      if (response.ok) {
        const data = await response.json();
        setGroupOrders(data.groupOrders || []);
      } else {
        throw new Error("Failed to fetch group orders");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch group orders");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...groupOrders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "expiresAt":
          aValue = new Date(a.expiresAt);
          bValue = new Date(b.expiresAt);
          break;
        case "progressPercentage":
          aValue = a.progressPercentage;
          bValue = b.progressPercentage;
          break;
        case "participantCount":
          aValue = a.participantCount;
          bValue = b.participantCount;
          break;
        case "currentAmount":
          aValue = a.currentAmount;
          bValue = b.currentAmount;
          break;
        default:
          aValue = a[sortBy as keyof GroupOrder];
          bValue = b[sortBy as keyof GroupOrder];
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string, additionalData?: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/admin/group-orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, ...additionalData }),
      });

      if (response.ok) {
        // Update local state
        setGroupOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus, ...additionalData }
              : order
          )
        );
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) return;
    
    setIsBulkUpdating(true);
    try {
      const promises = selectedOrders.map(orderId => 
        fetch(`/api/admin/group-orders/${orderId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        })
      );

      const responses = await Promise.all(promises);
      const failedUpdates = responses.filter(response => !response.ok);
      
      if (failedUpdates.length > 0) {
        throw new Error(`${failedUpdates.length} orders failed to update`);
      }

      // Update local state
      setGroupOrders(prev => 
        prev.map(order => 
          selectedOrders.includes(order.id) 
            ? { ...order, status: newStatus }
            : order
        )
      );

      setSelectedOrders([]);
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update some orders");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedOrders.length} group orders? This action cannot be undone.`)) {
      return;
    }

    setIsBulkUpdating(true);
    try {
      const promises = selectedOrders.map(orderId => 
        fetch(`/api/admin/group-orders/${orderId}`, {
          method: "DELETE",
        })
      );

      const responses = await Promise.all(promises);
      const failedDeletes = responses.filter(response => !response.ok);
      
      if (failedDeletes.length > 0) {
        throw new Error(`${failedDeletes.length} orders failed to delete`);
      }

      // Remove deleted orders from local state
      setGroupOrders(prev => prev.filter(order => !selectedOrders.includes(order.id)));
      setSelectedOrders([]);
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete some orders");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this group order? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/group-orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setGroupOrders(prev => prev.filter(order => order.id !== orderId));
      } else {
        throw new Error("Failed to delete group order");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete group order");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COLLECTING":
        return <Badge className="badge-warning">Collecting</Badge>;
      case "THRESHOLD_MET":
        return <Badge className="badge-success">Threshold Met</Badge>;
      case "ORDERED":
        return <Badge className="badge-secondary">Ordered</Badge>;
      case "SHIPPED":
        return <Badge className="badge-primary">Shipped</Badge>;
      case "DELIVERED":
        return <Badge className="badge-success">Delivered</Badge>;
      case "EXPIRED":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getActionButton = (order: GroupOrder) => {
    switch (order.status) {
      case "THRESHOLD_MET":
        return (
          <Button
            size="sm"
            className="bg-accent hover:bg-accent/90"
            onClick={() => handleStatusUpdate(order.id, "ORDERED")}
          >
            Mark as Ordered
          </Button>
        );
      case "ORDERED":
        return (
          <Button
            size="sm"
            className="bg-secondary hover:bg-secondary/90"
            onClick={() => handleStatusUpdate(order.id, "SHIPPED")}
          >
            Mark as Shipped
          </Button>
        );
      case "SHIPPED":
        return (
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              const actualDelivery = new Date().toISOString();
              handleStatusUpdate(order.id, "DELIVERED", { actualDelivery });
            }}
          >
            Mark as Delivered
          </Button>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <AdminNavigation user={{ name: "Admin", role: "ADMIN" }} />
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading group orders...</p>
            </div>
          </div>
        </MainContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AdminNavigation user={{ name: "Admin", role: "ADMIN" }} />

      <MainContainer className="max-w-7xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Group Orders Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage all group orders on the platform
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/group-orders/create">
              <Plus className="h-4 w-4 mr-2" />
              Create New Order
            </Link>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by product name or batch number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="all">All Statuses</option>
                  <option value="COLLECTING">Collecting</option>
                  <option value="THRESHOLD_MET">Threshold Met</option>
                  <option value="ORDERED">Ordered</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="EXPIRED">Expired</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="expiresAt">Expiry Date</option>
                  <option value="progressPercentage">Progress</option>
                  <option value="participantCount">Participants</option>
                  <option value="currentAmount">Current Amount</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Toolbar */}
        {selectedOrders.length > 0 && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-primary">
                    {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrders([])}
                  >
                    Clear Selection
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                    disabled={isBulkUpdating}
                  >
                    <option value="">Bulk Status Update</option>
                    <option value="COLLECTING">Mark as Collecting</option>
                    <option value="THRESHOLD_MET">Mark as Threshold Met</option>
                    <option value="ORDERED">Mark as Ordered</option>
                    <option value="SHIPPED">Mark as Shipped</option>
                    <option value="DELIVERED">Mark as Delivered</option>
                    <option value="EXPIRED">Mark as Expired</option>
                  </select>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={isBulkUpdating}
                  >
                    {isBulkUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Bulk Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Group Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span>Group Orders ({filteredOrders.length})</span>
                {filteredOrders.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all" className="text-sm text-muted-foreground">
                      Select All
                    </Label>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchGroupOrders}
                disabled={isLoading}
              >
                <Loader2 className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No group orders found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your filters or search terms."
                    : "Create your first group order to get started."
                  }
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button asChild>
                    <Link href="/admin/group-orders/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Group Order
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-6 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Checkbox
                            id={`order-${order.id}`}
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                          />
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(order.status)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-primary">
                              {order.product.name}
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              #{order.batchNumber}
                            </span>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {order.currentQuantity} / {order.targetQuantity} units
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {formatCurrency(order.currentAmount)} / {formatCurrency(order.minThreshold)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{order.participantCount} participants</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{order.timeRemaining} days left</span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(order.progressPercentage, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-primary">
                                {Math.round(order.progressPercentage)}%
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-muted-foreground">
                            Created: {formatDate(order.createdAt)} • 
                            Expires: {formatDate(order.expiresAt)}
                            {order.estimatedDelivery && ` • Delivery: ${formatDate(order.estimatedDelivery)}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getActionButton(order)}
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/group-orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>

                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/group-orders/${order.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(order.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </MainContainer>
    </div>
  );
} 