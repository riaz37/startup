"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminNavigation } from "@/components/admin";
import { MainContainer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  DollarSign, 
  Target, 
  Percent, 
  Image as ImageIcon,
  Save,
  Loader2
} from "lucide-react";
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
  groupOrderImageUrl: string;
  groupOrderImagePublicId: string;
  product: {
    id: string;
    name: string;
    unit: string;
    unitSize: number;
  };
  createdAt: string;
}

export default function EditGroupOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [groupOrder, setGroupOrder] = useState<GroupOrder | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<DiscountConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    if (params.id) {
      fetchGroupOrder(params.id as string);
      fetchProducts();
      fetchDiscounts();
    }
  }, [params.id]);

  const fetchGroupOrder = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/group-orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        const order = data.groupOrder;
        setGroupOrder(order);
        
        // Populate form data
        setFormData({
          productId: order.product.id,
          minThreshold: order.minThreshold.toString(),
          targetQuantity: order.targetQuantity.toString(),
          pricePerUnit: order.pricePerUnit.toString(),
          expiresAt: order.expiresAt.slice(0, 16), // Format for datetime-local input
          estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.split('T')[0] : "",
          groupOrderImageUrl: order.groupOrderImageUrl || "",
          groupOrderImagePublicId: order.groupOrderImagePublicId || ""
        });
      } else {
        throw new Error("Failed to fetch group order");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch group order");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await fetch("/api/admin/discounts");
      if (response.ok) {
        const data = await response.json();
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

      const now = new Date();
      if (discount.startDate && new Date(discount.startDate) > now) continue;
      if (discount.endDate && new Date(discount.endDate) < now) continue;

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
        discountedPrice = parseFloat(manualDiscount);
      } else if (selectedDiscounts.length > 0) {
        discountedPrice = calculateSelectedDiscounts(product.sellingPrice, targetQty);
      } else {
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
    setIsSaving(true);
    setError("");

    // Validate that expiresAt is in the future
    if (formData.expiresAt) {
      const expiresDate = new Date(formData.expiresAt);
      const now = new Date();
      if (expiresDate <= now) {
        setError("Expiry date must be in the future");
        setIsSaving(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/group-orders/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update group order");
      }

      router.push(`/admin/group-orders/${params.id}`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedProduct = products.find(p => p.id === formData.productId);
  const basePrice = selectedProduct?.sellingPrice || 0;
  const targetQty = parseInt(formData.targetQuantity) || 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <AdminNavigation user={{ name: "Admin", role: "ADMIN" }} />
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading group order...</p>
            </div>
          </div>
        </MainContainer>
      </div>
    );
  }

  if (error || !groupOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <AdminNavigation user={{ name: "Admin", role: "ADMIN" }} />
        <MainContainer>
          <div className="text-center py-8">
            <Alert variant="destructive">
              <AlertDescription>
                {error || "Group order not found"}
              </AlertDescription>
            </Alert>
            <Button className="mt-4" asChild>
              <Link href="/admin/group-orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Group Orders
              </Link>
            </Button>
          </div>
        </MainContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AdminNavigation user={{ name: "Admin", role: "ADMIN" }} />

      <MainContainer className="max-w-4xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/group-orders/${groupOrder.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Group Order</h1>
              {groupOrder && (
                <p className="text-muted-foreground">
                  #{groupOrder.batchNumber} - {groupOrder.product.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <Card>
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
                  Group Order Image
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
                </div>
              </div>

              {/* Price Per Unit */}
              <div className="space-y-2">
                <Label htmlFor="pricePerUnit" className="flex items-center">
                  <DollarSign className="h-4 w-4 text-primary mr-2" />
                  Price Per Unit (৳)
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
                    min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                  />
                </div>

                {/* Estimated Delivery */}
                <div className="space-y-2">
                  <Label htmlFor="estimatedDelivery" className="flex items-center">
                    <Calendar className="h-4 w-4 text-accent mr-2" />
                    Estimated Delivery Date
                  </Label>
                  <Input
                    type="date"
                    id="estimatedDelivery"
                    value={formData.estimatedDelivery}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/admin/group-orders/${groupOrder.id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSaving} className="flex-1">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
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