"use client";

import { useState, useEffect } from "react";
import { ClientPageLayout } from "@/components/layout/client-page-layout";
import { PageHeader, MainContainer } from "@/components/layout";
import { EmptyState } from "@/components/common";
import { ProductCard } from "@/components/products/product-card";
import { Package, Search, Filter, Grid, List } from "lucide-react";
import { Product } from "@/types";
import { ProductCardSkeleton, SearchResultsSkeleton } from "@/components/ui/skeleton";
import { EnhancedProductGridLoading } from "@/components/ui/enhanced-loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
    setVisibleCount(12); // Reset visible count when filters change
  }, [products, searchTerm, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      
      // The API returns { products: [...], pagination: {...} }
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        console.error('Products API returned unexpected data structure:', data);
        setProducts([]);
        setError(new Error('Invalid products data received'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      setProducts([]);
    } finally {
      setLoading(false);
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
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  const filterAndSortProducts = () => {
    // Ensure products is an array
    if (!Array.isArray(products)) {
      console.error('Products is not an array:', products);
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products]; // Create a copy to avoid mutating the original

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category?.id === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.sellingPrice - b.sellingPrice;
        case "price-high":
          return b.sellingPrice - a.sellingPrice;
        case "discount":
          const discountA = ((a.mrp - a.sellingPrice) / a.mrp) * 100;
          const discountB = ((b.mrp - b.sellingPrice) / b.mrp) * 100;
          return discountB - discountA;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const loadMore = async () => {
    if (isLoadingMore || visibleCount >= filteredProducts.length) return;
    
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 12, filteredProducts.length));
      setIsLoadingMore(false);
    }, 300);
  };

  const calculateDiscount = (mrp: number, sellingPrice: number) => {
    if (mrp <= sellingPrice) return 0;
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderProductCard = (product: Product, index: number) => (
    <ProductCard
      key={product.id}
      product={product}
      formatPrice={formatPrice}
      calculateDiscount={calculateDiscount}
    />
  );

  if (error) {
    return (
      <ClientPageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading products: {error.message}</p>
              <Button onClick={fetchProducts} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <ClientPageLayout>
      <MainContainer>
        <PageHeader
          badge="🛍️ Product Catalog"
          title="Quality Products at Great Prices"
          highlightedWord="Great Prices"
          description="Browse our curated selection of essential products. Join group orders to unlock bulk pricing and save even more on your favorite items."
        />

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Array.isArray(categories) && categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="discount">Highest Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid/List with Progressive Loading */}
        {loading ? (
          <EnhancedProductGridLoading count={12} />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Products Found"
            description={
              searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Products will appear here once they are added to our catalog."
            }
            actionLabel={searchTerm || selectedCategory !== "all" ? "Clear Filters" : "Seed Sample Products"}
            actionHref={searchTerm || selectedCategory !== "all" ? "#" : "/api/seed"}
            onAction={searchTerm || selectedCategory !== "all" ? () => {
              setSearchTerm("");
              setSelectedCategory("all");
            } : undefined}
          />
        ) : (
          <div className={viewMode === "list" ? "space-y-6" : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}>
            {visibleProducts.map((product, index) => renderProductCard(product, index))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 text-center">
            <Button 
              onClick={loadMore} 
              variant="outline" 
              size="lg"
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading..." : "Load More Products"}
            </Button>
          </div>
        )}
      </MainContainer>
    </ClientPageLayout>
  );
}