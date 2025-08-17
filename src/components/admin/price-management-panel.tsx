"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  CheckCircle,
  DollarSign,
  BarChart3
} from "lucide-react";
import { PriceTrendsChart } from "./price-trends-chart";

interface PriceHistory {
  id: string;
  mrp: number;
  sellingPrice: number;
  changeReason: string;
  admin: { name: string; email: string } | null;
  createdAt: string;
}



interface PriceTrends {
  trend: 'rising' | 'falling' | 'stable';
  changePercentage: number;
  volatility: number;
}

export function PriceManagementPanel() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [priceTrends, setPriceTrends] = useState<PriceTrends | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Price update form state
  const [priceUpdateForm, setPriceUpdateForm] = useState({
    newMrp: '',
    newSellingPrice: '',
    changeReason: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchPriceHistory(selectedProduct);
      fetchPriceTrends(selectedProduct);
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        credentials: 'include'
      });
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      // Handle error silently
    }
  };

  const fetchPriceHistory = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/price-management?action=price-history&productId=${productId}&days=30`, {
        credentials: 'include'
      });
      const data = await response.json();
      setPriceHistory(data.history || []);
    } catch (error) {
      // Handle error silently
    }
  };

  const fetchPriceTrends = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/price-management?action=price-trends&productId=${productId}&days=30`, {
        credentials: 'include'
      });
      const data = await response.json();
      setPriceTrends(data.trends || null);
    } catch (error) {
      // Handle error silently
    }
  };



  const handlePriceUpdate = async () => {
    if (!selectedProduct || !priceUpdateForm.changeReason) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/price-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'update-prices',
          productId: selectedProduct,
          newMrp: parseFloat(priceUpdateForm.newMrp),
          newSellingPrice: parseFloat(priceUpdateForm.newSellingPrice),
          changeReason: priceUpdateForm.changeReason
        })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Prices updated successfully!' });
        setPriceUpdateForm({ newMrp: '', newSellingPrice: '', changeReason: '' });
        fetchPriceHistory(selectedProduct);
        fetchPriceTrends(selectedProduct);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update prices' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating prices' });
    } finally {
      setLoading(false);
    }
  };



  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'falling': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-red-600';
      case 'falling': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  // Show error if no session
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">No active session. Please log in.</p>
        </div>
      </div>
    );
  }

  // Show error if user doesn't have admin privileges
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Access denied. Admin privileges required.</p>
          <p className="text-sm text-gray-600">Current role: {session.user.role}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Price Management</h2>
        <Badge variant="outline" className="text-sm">
          <Clock className="h-4 w-4 mr-2" />
          Real-time Updates
        </Badge>
      </div>
      


      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="price-updates">Price Updates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">


            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products Tracked</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active products
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Price Changes Today</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {priceHistory.filter(h => 
                    new Date(h.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Price Update</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="product-select">Select Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="change-reason">Change Reason</Label>
                  <Input
                    id="change-reason"
                    placeholder="e.g., Supplier cost increase"
                    value={priceUpdateForm.changeReason}
                    onChange={(e) => setPriceUpdateForm(prev => ({ ...prev, changeReason: e.target.value }))}
                  />
                </div>
              </div>
              
              {selectedProduct && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-mrp">New MRP</Label>
                    <Input
                      id="new-mrp"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={priceUpdateForm.newMrp}
                      onChange={(e) => setPriceUpdateForm(prev => ({ ...prev, newMrp: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-selling">New Selling Price</Label>
                    <Input
                      id="new-selling"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={priceUpdateForm.newSellingPrice}
                      onChange={(e) => setPriceUpdateForm(prev => ({ ...prev, newSellingPrice: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={handlePriceUpdate} 
                disabled={loading || !selectedProduct || !priceUpdateForm.changeReason}
                className="w-full"
              >
                {loading ? 'Updating...' : 'Update Prices'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="price-updates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProduct ? (
                <div className="space-y-4">
                  {priceTrends && (
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(priceTrends.trend)}
                        <span className={`font-semibold ${getTrendColor(priceTrends.trend)}`}>
                          {priceTrends.trend.charAt(0).toUpperCase() + priceTrends.trend.slice(1)}
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-6" />
                      <div className="text-sm text-gray-600">
                        Change: {priceTrends.changePercentage.toFixed(2)}%
                      </div>
                      <Separator orientation="vertical" className="h-6" />
                      <div className="text-sm text-gray-600">
                        Volatility: {priceTrends.volatility.toFixed(2)}%
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {priceHistory.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">
                            ₹{record.sellingPrice.toFixed(2)} per unit
                          </div>
                          <div className="text-sm text-gray-600">
                            {record.changeReason}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(record.createdAt).toLocaleDateString()} by {record.admin?.name || 'System'}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div>MRP: ₹{record.mrp.toFixed(2)}</div>
                          <div>Selling Price: ₹{record.sellingPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a product to view price history
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Price Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceTrendsChart 
                priceHistory={priceHistory}
                priceTrends={priceTrends}
                selectedProduct={selectedProduct}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 