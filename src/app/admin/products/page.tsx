"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNavigation } from '@/components/admin';
import { MainContainer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Package, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  MoreHorizontal,
  DollarSign,
  Tag
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

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (error) {
      setError("Failed to load products");
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category.id === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      setError("Failed to delete product");
      console.error("Error deleting product:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <AdminNavigation user={{ name: "Admin", role: "ADMIN" }} />
        <MainContainer className="max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Product{" "}
              <span className="bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your product inventory, pricing, and availability
            </p>
          </div>
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/admin/products/create">
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-sohozdaam">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Tag className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                  <p className="text-2xl font-bold text-green-600">
                    {products.filter(p => p.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Selling Price</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {products.length > 0 
                      ? formatPrice(products.reduce((sum, p) => sum + p.sellingPrice, 0) / products.length)
                      : '৳0.00'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-sohozdaam">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Filter className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="card-sohozdaam mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="card-sohozdaam">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory 
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first product"
                }
              </p>
              {!searchTerm && !selectedCategory && (
                <Button asChild>
                  <Link href="/admin/products/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Product
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="card-sohozdaam hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Product Image */}
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-muted">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <Badge 
                      variant={product.isActive ? "default" : "secondary"}
                      className="absolute top-2 right-2"
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{product.category.name}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {product.unitSize} {product.unit}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">MRP:</span>
                        <span className="font-medium">{formatPrice(product.mrp)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Selling Price:</span>
                        <span className="font-medium text-primary">{formatPrice(product.sellingPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Min Order:</span>
                        <span className="font-medium">{product.minOrderQty}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Updated: {formatDate(product.updatedAt)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/admin/products/${product.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </MainContainer>
    </div>
  );
} 