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
  Truck, 
  MapPin, 
  Calendar, 
  Package, 
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Plus
} from "lucide-react";

interface Delivery {
  id: string;
  orderNumber: string;
  customerName: string;
  deliveryType: 'PICKUP' | 'HOME_DELIVERY';
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  pickupLocation?: string;
  deliveryAddress?: string;
  scheduledDate: string;
  actualDeliveryDate?: string;
  trackingNumber?: string;
  notes?: string;
}

interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isActive: boolean;
  operatingHours: string;
}

export function DeliveryManagementPanel() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState("all");

  useEffect(() => {
    fetchDeliveries();
    fetchPickupLocations();
  }, []);

  const fetchDeliveries = async () => {
    // Mock data - in real app, fetch from API
    const mockDeliveries: Delivery[] = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        customerName: 'John Doe',
        deliveryType: 'PICKUP',
        status: 'PENDING',
        pickupLocation: 'Central Mall, Ground Floor',
        scheduledDate: '2024-01-15',
        notes: 'Customer prefers evening pickup',
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        customerName: 'Jane Smith',
        deliveryType: 'HOME_DELIVERY',
        status: 'IN_TRANSIT',
        deliveryAddress: '123 Main St, City Center',
        scheduledDate: '2024-01-15',
        trackingNumber: 'TRK-001',
        notes: 'Delivery between 2-4 PM',
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        customerName: 'Bob Johnson',
        deliveryType: 'PICKUP',
        status: 'DELIVERED',
        pickupLocation: 'Downtown Plaza, Level 2',
        scheduledDate: '2024-01-14',
        actualDeliveryDate: '2024-01-14',
        notes: 'Picked up successfully',
      },
    ];

    setDeliveries(mockDeliveries);
    setIsLoading(false);
  };

  const fetchPickupLocations = async () => {
    // Mock data - in real app, fetch from API
    const mockLocations: PickupLocation[] = [
      {
        id: '1',
        name: 'Central Mall, Ground Floor',
        address: '123 Central Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isActive: true,
        operatingHours: '10:00 AM - 8:00 PM',
      },
      {
        id: '2',
        name: 'Downtown Plaza, Level 2',
        address: '456 Downtown Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002',
        isActive: true,
        operatingHours: '9:00 AM - 9:00 PM',
      },
    ];

    setPickupLocations(mockLocations);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary", text: "Pending" },
      IN_TRANSIT: { variant: "default", text: "In Transit" },
      DELIVERED: { variant: "default", text: "Delivered" },
      FAILED: { variant: "destructive", text: "Failed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "outline", text: status };
    
    return (
      <Badge variant={config.variant as any}>
        {config.text}
      </Badge>
    );
  };

  const getDeliveryTypeIcon = (type: string) => {
    return type === 'PICKUP' ? (
      <MapPin className="h-4 w-4 text-blue-600" />
    ) : (
      <Truck className="h-4 w-4 text-green-600" />
    );
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;
    const matchesType = deliveryTypeFilter === "all" || delivery.deliveryType === deliveryTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const updateDeliveryStatus = async (deliveryId: string, newStatus: string) => {
    // In real app, make API call to update status
    setDeliveries(prev => 
      prev.map(d => 
        d.id === deliveryId 
          ? { ...d, status: newStatus as any }
          : d
      )
    );
  };

  if (isLoading) {
    return (
      <Card className="card-sohozdaam mb-8">
        <CardContent className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading delivery data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Filters and Search */}
      <Card className="card-sohozdaam">
        <CardHeader>
          <CardTitle>Delivery Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search orders or customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type-filter">Delivery Type</Label>
              <Select value={deliveryTypeFilter} onValueChange={setDeliveryTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PICKUP">Pickup</SelectItem>
                  <SelectItem value="HOME_DELIVERY">Home Delivery</SelectItem>
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
                  setDeliveryTypeFilter("all");
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries List */}
      <Card className="card-sohozdaam">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Deliveries ({filteredDeliveries.length})</span>
            <Button variant="outline" size="sm" onClick={fetchDeliveries}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getDeliveryTypeIcon(delivery.deliveryType)}
                      <div>
                        <h3 className="font-medium">{delivery.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {delivery.customerName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        {getStatusBadge(delivery.status)}
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium capitalize">
                          {delivery.deliveryType.toLowerCase().replace('_', ' ')}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Scheduled</p>
                        <p className="font-medium">
                          {new Date(delivery.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium text-sm">
                          {delivery.deliveryType === 'PICKUP' 
                            ? delivery.pickupLocation 
                            : delivery.deliveryAddress}
                        </p>
                      </div>
                    </div>

                    {delivery.notes && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        <p><strong>Notes:</strong> {delivery.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {delivery.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateDeliveryStatus(delivery.id, 'IN_TRANSIT')}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Start Delivery
                      </Button>
                    )}
                    
                    {delivery.status === 'IN_TRANSIT' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateDeliveryStatus(delivery.id, 'DELIVERED')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Delivered
                      </Button>
                    )}
                    
                    {delivery.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateDeliveryStatus(delivery.id, 'FAILED')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Mark Failed
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pickup Locations */}
      <Card className="card-sohozdaam">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pickup Locations ({pickupLocations.length})</span>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pickupLocations.map((location) => (
              <div
                key={location.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">{location.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {location.address}, {location.city}, {location.state} {location.pincode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Hours:</strong> {location.operatingHours}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={location.isActive ? "default" : "secondary"}>
                      {location.isActive ? "Active" : "Inactive"}
                    </Badge>
                    
                    <Button variant="ghost" size="sm">
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 