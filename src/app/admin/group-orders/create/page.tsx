"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminNavigation } from "@/components/admin";
import { MainContainer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Package, Calendar, DollarSign, Target } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  unit: string;
  unitSize: number;
  sellingPrice: number;
}

export default function CreateGroupOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    productId: "",
    minThreshold: "",
    targetQuantity: "",
    pricePerUnit: "",
    expiresAt: "",
    estimatedDelivery: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        productId,
        pricePerUnit: (product.sellingPrice * 0.9).toString() // 10% bulk discount
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/group-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create group order");
      }

      router.push("/admin");
    } catch (error: unknown) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === formData.productId);

  // Mock user for AdminNavigation - in real app, get from auth
  const mockUser = { name: "Admin", role: "ADMIN" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AdminNavigation user={mockUser} />

      <MainContainer className="max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-4xl font-bold">
              Create New{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Group Order
              </span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Set up a new group order for bulk purchasing and help customers save money together.
          </p>
        </div>

        <Card className="card-sohozdaam">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-6 w-6 text-primary mr-2" />
              Group Order Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="productId" className="flex items-center">
                  <Package className="h-4 w-4 text-primary mr-2" />
                  Product
                </Label>
                <select
                  id="productId"
                  value={formData.productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.unitSize} {product.unit})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <Card className="bg-muted/50 border-l-4 border-primary">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Package className="h-4 w-4 text-primary mr-2" />
                      Product Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Regular Price:</span>
                        <span className="ml-2 font-semibold text-primary">
                          ₹{selectedProduct.sellingPrice} per {selectedProduct.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Unit Size:</span>
                        <span className="ml-2 font-semibold">
                          {selectedProduct.unitSize} {selectedProduct.unit}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Minimum Threshold */}
                <div className="space-y-2">
                  <Label htmlFor="minThreshold" className="flex items-center">
                    <DollarSign className="h-4 w-4 text-secondary mr-2" />
                    Minimum Threshold Amount (₹)
                  </Label>
                  <Input
                    type="number"
                    id="minThreshold"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, minThreshold: e.target.value }))}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g., 5000"
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum total amount needed to proceed with the order
                  </p>
                </div>

                {/* Target Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="targetQuantity" className="flex items-center">
                    <Target className="h-4 w-4 text-accent mr-2" />
                    Target Quantity
                  </Label>
                  <Input
                    type="number"
                    id="targetQuantity"
                    value={formData.targetQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetQuantity: e.target.value }))}
                    required
                    min="1"
                    placeholder="e.g., 100"
                  />
                  <p className="text-sm text-muted-foreground">
                    Total quantity to order from supplier
                  </p>
                </div>
              </div>

              {/* Price Per Unit */}
              <div className="space-y-2">
                <Label htmlFor="pricePerUnit" className="flex items-center">
                  <DollarSign className="h-4 w-4 text-primary mr-2" />
                  Bulk Price Per Unit (₹)
                </Label>
                <Input
                  type="number"
                  id="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                  required
                  min="0"
                  step="0.01"
                />
                <p className="text-sm text-muted-foreground">
                  Discounted price for bulk purchase (automatically calculated as 10% off regular price)
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Expires At */}
                <div className="space-y-2">
                  <Label htmlFor="expiresAt" className="flex items-center">
                    <Calendar className="h-4 w-4 text-secondary mr-2" />
                    Order Expires On
                  </Label>
                  <Input
                    type="datetime-local"
                    id="expiresAt"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-sm text-muted-foreground">
                    When to stop accepting orders
                  </p>
                </div>

                {/* Estimated Delivery */}
                <div className="space-y-2">
                  <Label htmlFor="estimatedDelivery" className="flex items-center">
                    <Calendar className="h-4 w-4 text-accent mr-2" />
                    Estimated Delivery Date (Optional)
                  </Label>
                  <Input
                    type="date"
                    id="estimatedDelivery"
                    value={formData.estimatedDelivery}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-sm text-muted-foreground">
                    Expected delivery date for customers
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/admin">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Group Order
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </MainContainer>
    </div>
  );
}