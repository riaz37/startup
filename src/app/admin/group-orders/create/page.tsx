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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Package, Calendar, DollarSign, Target, Percent, Tag, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { ImageUploadWithPreview } from "@/components/ui/image-upload-with-preview";

interface Product {
  id: string;
  name: string;
  unit: string;
  unitSize: number;
  sellingPrice: number;
}

interface DiscountConfig {
  id: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  isActive: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  startDate?: Date;
  endDate?: Date;
}

export default function CreateGroupOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<DiscountConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    productId: "",
    minThreshold: "",
    targetQuantity: "",
    pricePerUnit: "",
    expiresAt: "",
    estimatedDelivery: "",
    groupOrderImageUrl: "",
    groupOrderImagePublicId: ""
  });

  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [manualDiscount, setManualDiscount] = useState("");
  const [useManualDiscount, setUseManualDiscount] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchDiscounts();
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

  const fetchDiscounts = async () => {
    try {
      const response = await fetch("/api/admin/discounts");
      if (response.ok) {
        const data = await response.json();
        // Filter for active discounts
        const now = new Date();
        const activeDiscounts = data.filter((discount: DiscountConfig) => {
          if (!discount.isActive) return false;
          if (discount.startDate && new Date(discount.startDate) > now) return false;
          if (discount.endDate && new Date(discount.endDate) < now) return false;
          return true;
        });
        setDiscounts(activeDiscounts);
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  const calculateAutomaticDiscount = (basePrice: number, quantity: number) => {
    if (!discounts || discounts.length === 0) {
      return basePrice;
    }

    let totalDiscount = 0;
    for (const discount of discounts) {
      if (!discount.isActive) continue;

      // Check date range
      const now = new Date();
      if (discount.startDate && new Date(discount.startDate) > now) continue;
      if (discount.endDate && new Date(discount.endDate) < now) continue;

      // Check quantity range
      if (discount.minQuantity && quantity < discount.minQuantity) continue;
      if (discount.maxQuantity && quantity > discount.maxQuantity) continue;

      if (discount.discountType === 'PERCENTAGE') {
        totalDiscount += (basePrice * discount.discountValue) / 100;
      } else if (discount.discountType === 'FIXED_AMOUNT') {
        totalDiscount += discount.discountValue;
      }
    }

    return Math.max(0, basePrice - totalDiscount);
  };

  const calculateSelectedDiscounts = (basePrice: number, quantity: number) => {
    if (selectedDiscounts.length === 0) {
      return basePrice;
    }

    let totalDiscount = 0;
    for (const discountId of selectedDiscounts) {
      const discount = discounts.find(d => d.id === discountId);
      if (!discount) continue;

      // Check quantity range
      if (discount.minQuantity && quantity < discount.minQuantity) continue;
      if (discount.maxQuantity && quantity > discount.maxQuantity) continue;

      if (discount.discountType === 'PERCENTAGE') {
        totalDiscount += (basePrice * discount.discountValue) / 100;
      } else if (discount.discountType === 'FIXED_AMOUNT') {
        totalDiscount += discount.discountValue;
      }
    }

    return Math.max(0, basePrice - totalDiscount);
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const targetQty = parseInt(formData.targetQuantity) || 1;
      let discountedPrice: number;

      if (useManualDiscount && manualDiscount) {
        // Use manual discount
        discountedPrice = parseFloat(manualDiscount);
      } else if (selectedDiscounts.length > 0) {
        // Use selected discounts
        discountedPrice = calculateSelectedDiscounts(product.sellingPrice, targetQty);
      } else {
        // Use automatic discount calculation
        discountedPrice = calculateAutomaticDiscount(product.sellingPrice, targetQty);
      }
      
      setFormData(prev => ({
        ...prev,
        productId,
        pricePerUnit: discountedPrice.toString()
      }));
    }
  };

  const handleQuantityChange = (quantity: string) => {
    setFormData(prev => ({ ...prev, targetQuantity: quantity }));
    
    // Recalculate price if product is selected
    if (formData.productId) {
      const product = products.find(p => p.id === formData.productId);
      if (product) {
        const qty = parseInt(quantity) || 1;
        let discountedPrice: number;

        if (useManualDiscount && manualDiscount) {
          discountedPrice = parseFloat(manualDiscount);
        } else if (selectedDiscounts.length > 0) {
          discountedPrice = calculateSelectedDiscounts(product.sellingPrice, qty);
        } else {
          discountedPrice = calculateAutomaticDiscount(product.sellingPrice, qty);
        }

        setFormData(prev => ({ ...prev, pricePerUnit: discountedPrice.toString() }));
      }
    }
  };

  const handleDiscountSelection = (discountId: string, checked: boolean) => {
    if (checked) {
      setSelectedDiscounts(prev => [...prev, discountId]);
      setUseManualDiscount(false);
    } else {
      setSelectedDiscounts(prev => prev.filter(id => id !== discountId));
    }
    
    // Recalculate price
    if (formData.productId && formData.targetQuantity) {
      handleQuantityChange(formData.targetQuantity);
    }
  };

  const handleManualDiscountChange = (value: string) => {
    setManualDiscount(value);
    setSelectedDiscounts([]);
    
    if (formData.productId && formData.targetQuantity) {
      const product = products.find(p => p.id === formData.productId);
      if (product) {
        setFormData(prev => ({ ...prev, pricePerUnit: value }));
      }
    }
  };

  const handleImageUpload = (imageUrl: string, publicId: string) => {
    setFormData(prev => ({
      ...prev,
      groupOrderImageUrl: imageUrl,
      groupOrderImagePublicId: publicId
    }));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      groupOrderImageUrl: "",
      groupOrderImagePublicId: ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate that expiresAt is in the future
    if (formData.expiresAt) {
      const expiresDate = new Date(formData.expiresAt);
      const now = new Date();
      if (expiresDate <= now) {
        setError("Expiry date must be in the future");
        setIsLoading(false);
        return;
      }
    }

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
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === formData.productId);
  const basePrice = selectedProduct?.sellingPrice || 0;
  const targetQty = parseInt(formData.targetQuantity) || 1;

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
              <span className="bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
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
                  className="w-full p-2 border border-input rounded-md bg-background"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ৳{product.sellingPrice}/{product.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Order Image */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <ImageIcon className="h-4 w-4 text-primary mr-2" />
                  Group Order Image (Optional)
                </Label>
                <ImageUploadWithPreview
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  currentImageUrl={formData.groupOrderImageUrl}
                  previewType="group-order"
                  previewData={{
                    name: `Group Order - ${products.find(p => p.id === formData.productId)?.name || 'Product'}`,
                    description: `Group order for ${formData.targetQuantity} units`,
                    price: parseFloat(formData.pricePerUnit) || 0,
                    minThreshold: parseFloat(formData.minThreshold) || 0,
                    targetQuantity: parseInt(formData.targetQuantity) || 0,
                    expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toLocaleDateString() : '7 days'
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Upload a promotional image for this group order. This will be displayed to customers.
                </p>
              </div>

              {/* Quantity and Threshold */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minThreshold" className="flex items-center">
                    <Target className="h-4 w-4 text-primary mr-2" />
                    Minimum Threshold (৳)
                  </Label>
                  <Input
                    type="number"
                    id="minThreshold"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, minThreshold: e.target.value }))}
                    required
                    min="0"
                    placeholder="e.g., 5000"
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum total order value to trigger the group order
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetQuantity" className="flex items-center">
                    <Target className="h-4 w-4 text-primary mr-2" />
                    Target Quantity
                  </Label>
                  <Input
                    type="number"
                    id="targetQuantity"
                    value={formData.targetQuantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    required
                    min="1"
                    placeholder="e.g., 100"
                  />
                  <p className="text-sm text-muted-foreground">
                    Total quantity to order from supplier
                  </p>
                </div>
              </div>

              {/* Discount Configuration */}
              <div className="space-y-4">
                <Label className="flex items-center">
                  <Percent className="h-4 w-4 text-primary mr-2" />
                  Discount Configuration
                </Label>
                
                {/* Manual Discount Option */}
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="useManualDiscount"
                    checked={useManualDiscount}
                    onCheckedChange={(checked) => {
                      setUseManualDiscount(checked as boolean);
                      if (checked) {
                        setSelectedDiscounts([]);
                      }
                    }}
                  />
                  <Label htmlFor="useManualDiscount">Use manual discount price</Label>
                </div>

                {useManualDiscount && (
                  <div className="space-y-2">
                    <Label htmlFor="manualDiscount">Manual Price Per Unit (৳)</Label>
                    <Input
                      id="manualDiscount"
                      type="number"
                      value={manualDiscount}
                      onChange={(e) => handleManualDiscountChange(e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="Enter custom price"
                    />
                  </div>
                )}

                {/* Automatic Discount Selection */}
                {!useManualDiscount && discounts.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Select which discounts to apply (or leave empty for automatic calculation):
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {discounts.map((discount) => {
                        const isApplicable = (!discount.minQuantity || targetQty >= discount.minQuantity) &&
                                           (!discount.maxQuantity || targetQty <= discount.maxQuantity);
                        
                        return (
                          <div key={discount.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Checkbox
                              id={`discount-${discount.id}`}
                              checked={selectedDiscounts.includes(discount.id)}
                              onCheckedChange={(checked) => handleDiscountSelection(discount.id, checked as boolean)}
                              disabled={!isApplicable}
                            />
                            <div className="flex-1">
                              <Label htmlFor={`discount-${discount.id}`} className="flex items-center">
                                {discount.name}
                                {!isApplicable && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Not applicable for Qty: {targetQty}
                                  </Badge>
                                )}
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {discount.description}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary">
                                  {discount.discountType === 'PERCENTAGE' 
                                    ? `${discount.discountValue}% off` 
                                    : `৳${discount.discountValue} off`
                                  }
                                </Badge>
                                {discount.minQuantity && (
                                  <span className="text-xs text-muted-foreground">
                                    Min: {discount.minQuantity}
                                  </span>
                                )}
                                {discount.maxQuantity && (
                                  <span className="text-xs text-muted-foreground">
                                    Max: {discount.maxQuantity}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Calculation Display */}
                {selectedProduct && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <h4 className="font-medium">Price Calculation</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Base Price:</span>
                        <span className="ml-2 font-medium">৳{basePrice}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="ml-2 font-medium">{targetQty}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Base Value:</span>
                        <span className="ml-2 font-medium">৳{basePrice * targetQty}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Final Price Per Unit:</span>
                        <span className="ml-2 font-medium text-primary">৳{formData.pricePerUnit}</span>
                      </div>
                    </div>
                    
                    {!useManualDiscount && selectedDiscounts.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Applied Discounts:</p>
                        <div className="space-y-1">
                          {selectedDiscounts.map(discountId => {
                            const discount = discounts.find(d => d.id === discountId);
                            if (!discount) return null;
                            
                            let discountAmount = 0;
                            if (discount.discountType === 'PERCENTAGE') {
                              discountAmount = (basePrice * discount.discountValue) / 100;
                            } else if (discount.discountType === 'FIXED_AMOUNT') {
                              discountAmount = discount.discountValue;
                            }
                            
                            return (
                              <div key={discount.id} className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{discount.name}</span>
                                <Badge variant="secondary">
                                  {discount.discountType === 'PERCENTAGE' 
                                    ? `${discount.discountValue}% off` 
                                    : `৳${discount.discountValue} off`
                                  }
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Per Unit */}
              <div className="space-y-2">
                <Label htmlFor="pricePerUnit" className="flex items-center">
                  <DollarSign className="h-4 w-4 text-primary mr-2" />
                  Final Price Per Unit (৳)
                </Label>
                <Input
                  type="number"
                  id="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                  required
                  min="0"
                  step="0.01"
                  readOnly={!useManualDiscount}
                  className={!useManualDiscount ? "bg-muted" : ""}
                />
                <p className="text-sm text-muted-foreground">
                  {useManualDiscount 
                    ? "Enter the final price per unit for this group order"
                    : "Automatically calculated based on selected discounts and quantity"
                  }
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
                    min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)} // At least 1 hour from now
                  />
                  <p className="text-sm text-muted-foreground">
                    When to stop accepting orders (must be at least 1 hour from now)
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