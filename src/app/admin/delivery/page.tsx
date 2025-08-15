import { requireAdmin } from "@/lib/auth-utils";
import { MainContainer } from "@/components/layout";
import { AdminNavigation } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Package, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import { DeliveryManagementPanel } from "@/components/admin/delivery-management-panel";

export default async function DeliveryManagementPage() {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AdminNavigation user={user} />

      <MainContainer>
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Truck className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-4xl font-bold">
              Delivery{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage deliveries, pickup locations, and delivery scheduling for all orders.
          </p>
        </div>

        {/* Delivery Management Panel */}
        <DeliveryManagementPanel />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-sohozdaam">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-6 w-6 text-primary mr-2" />
                Add Pickup Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create new pickup locations for customers to collect their orders.
              </p>
              <Button className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-6 w-6 text-primary mr-2" />
                Schedule Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Schedule home deliveries for orders that require delivery service.
              </p>
              <Button className="w-full">
                <Truck className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-6 w-6 text-primary mr-2" />
                Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Perform bulk operations on multiple deliveries at once.
              </p>
              <Button className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-sohozdaam">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Deliveries</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Truck className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivered Today</p>
                  <p className="text-2xl font-bold">18</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pickup Locations</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Methods Overview */}
        <Card className="card-sohozdaam mb-8">
          <CardHeader>
            <CardTitle>Delivery Methods Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Pickup vs Home Delivery</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pickup</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Home Delivery</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Delivery Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending</span>
                    <Badge variant="secondary">24</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">In Transit</span>
                    <Badge variant="default">12</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Delivered</span>
                    <Badge variant="default">18</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Failed</span>
                    <Badge variant="destructive">2</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </MainContainer>
    </div>
  );
} 