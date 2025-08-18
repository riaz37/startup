"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminNavigation } from '@/components/admin';
import { MainContainer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUploadWithPreview } from '@/components/ui/image-upload-with-preview';
import { ArrowLeft, Save, Package, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  unit: string;
  unitSize: string;
  mrp: number;
  sellingPrice: number;
  minOrderQty: number;
  maxOrderQty?: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    unit: '',
    unitSize: '',
    mrp: '',
    sellingPrice: '',
    minOrderQty: '',
    maxOrderQty: '',
    isActive: true,
    imageUrl: ''
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchCategories();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}?admin=true`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
        
        // Populate form data
        setFormData({
          name: data.product.name || '',
          description: data.product.description || '',
          categoryId: data.product.category?.id || '',
          unit: data.product.unit || '',
          unitSize: data.product.unitSize || '',
          mrp: data.product.mrp?.toString() || '',
          sellingPrice: data.product.sellingPrice?.toString() || '',
          minOrderQty: data.product.minOrderQty?.toString() || '',
          maxOrderQty: data.product.maxOrderQty?.toString() || '',
          isActive: data.product.isActive ?? true,
          imageUrl: data.product.imageUrl || ''
        });
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      setError('Failed to load product');
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        // The API returns { success: true, categories: [...] }
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          console.error('Categories API returned unexpected data structure:', data);
          setCategories([]);
        }
      } else {
        console.error('Failed to fetch categories:', response.status, response.statusText);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId || !formData.unit || !formData.unitSize) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const requestBody = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        unit: formData.unit,
        unitSize: parseFloat(formData.unitSize) || 0,
        mrp: parseFloat(formData.mrp) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        minOrderQty: parseInt(formData.minOrderQty) || 1,
        maxOrderQty: formData.maxOrderQty ? parseInt(formData.maxOrderQty) : undefined,
        isActive: formData.isActive,
        imageUrl: formData.imageUrl
      };

      console.log('Sending product update request:', requestBody);

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        setSuccess('Product updated successfully!');
        // Refresh product data
        await fetchProduct();
      } else {
        const errorData = await response.json();
        console.error('Product update failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.error || errorData.message || 'Failed to update product');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update product');
      console.error('Error updating product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavigation user={{ name: "Admin", role: "Administrator" }} />
        <MainContainer>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading product...</p>
            </div>
          </div>
        </MainContainer>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavigation user={{ name: "Admin", role: "Administrator" }} />
        <MainContainer>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The product you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Button asChild>
                <Link href="/admin/products">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Link>
              </Button>
            </div>
          </div>
        </MainContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation user={{ name: "Admin", role: "Administrator" }} />
      <MainContainer>
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          
          <Card className="card-sohozdaam">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Edit Product: {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error and Success Alerts */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Product Image */}
                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <ImageUploadWithPreview
                    currentImageUrl={formData.imageUrl}
                    onImageUpload={handleImageUpload}
                    className="w-full"
                    previewType="product"
                    previewData={{
                      name: formData.name,
                      description: formData.description,
                      category: categories.find(c => c.id === formData.categoryId)?.name,
                      price: parseFloat(formData.sellingPrice) || 0,
                      unit: formData.unit,
                      unitSize: formData.unitSize
                    }}
                  />
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => handleInputChange('categoryId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                {/* Unit and Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      placeholder="e.g., kg, liter, piece"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unitSize">Unit Size *</Label>
                    <Input
                      id="unitSize"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unitSize}
                      onChange={(e) => handleInputChange('unitSize', e.target.value)}
                      placeholder="e.g., 1, 500, 250"
                      required
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mrp">MRP (৳)</Label>
                    <Input
                      id="mrp"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.mrp}
                      onChange={(e) => handleInputChange('mrp', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice">Selling Price (৳)</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.sellingPrice}
                      onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Order Quantities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minOrderQty">Minimum Order Quantity *</Label>
                    <Input
                      id="minOrderQty"
                      type="number"
                      min="1"
                      value={formData.minOrderQty}
                      onChange={(e) => handleInputChange('minOrderQty', e.target.value)}
                      placeholder="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxOrderQty">Maximum Order Quantity</Label>
                    <Input
                      id="maxOrderQty"
                      type="number"
                      min="1"
                      value={formData.maxOrderQty}
                      onChange={(e) => handleInputChange('maxOrderQty', e.target.value)}
                      placeholder="Leave empty for no limit"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Product is active</Label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" asChild>
                    <Link href="/admin/products">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </MainContainer>
    </div>
  );
} 