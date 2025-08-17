"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminNavigation } from '@/components/admin';
import { MainContainer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package, 
  Tag, 
  DollarSign, 
  Calendar,
  AlertCircle,
  Eye,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

export default function ProductViewPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}?admin=true`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
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

  const handleDeleteProduct = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      setError('Failed to delete product');
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          
          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button asChild>
              <Link href={`/admin/products/${product.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProduct}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete Product'}
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Image */}
            <Card className="card-sohozdaam">
              <CardContent className="p-6">
                <div className="relative h-96 rounded-lg overflow-hidden bg-muted">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                  <Badge 
                    variant={product.isActive ? "default" : "secondary"}
                    className="absolute top-4 right-4"
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="card-sohozdaam">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                    <p className="text-muted-foreground">{product.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{product.category.name}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {product.unitSize} {product.unit}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Information */}
              <Card className="card-sohozdaam">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MRP:</span>
                    <span className="font-medium">{formatPrice(product.mrp)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Selling Price:</span>
                    <span className="font-medium text-primary text-lg">{formatPrice(product.sellingPrice)}</span>
                  </div>
                  
                  {product.mrp > product.sellingPrice && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Discount: {formatPrice(product.mrp - product.sellingPrice)} 
                        ({Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)}%)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card className="card-sohozdaam">
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimum Order:</span>
                    <span className="font-medium">{product.minOrderQty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maximum Order:</span>
                    <span className="font-medium">
                      {product.maxOrderQty || 'No limit'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card className="card-sohozdaam">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Timestamps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="text-sm">{formatDate(product.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="text-sm">{formatDate(product.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainContainer>
    </div>
  );
} 