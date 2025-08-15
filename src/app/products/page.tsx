'use client';


import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { EmptyState } from "@/components/common";
import { ProductCard } from "@/components/products/product-card";
import { Package } from "lucide-react";
import { useProducts } from "@/hooks/api";

export default function ProductsPage() {
  const { data: productsResponse, isPending: loading, error, refetch } = useProducts();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (mrp: number, sellingPrice: number) => {
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  };

  const handleSeedProducts = async () => {
    try {
      await fetch("/api/seed", { method: "POST" });
      refetch(); // Refetch products after seeding
    } catch (error) {
      console.error("Failed to seed products:", error);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </MainContainer>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
                      <div className="text-center">
            <p className="text-red-600 mb-4">Error loading products: {error?.message || 'Unknown error'}</p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
          </div>
        </MainContainer>
      </PageLayout>
    );
  }

  const products = productsResponse?.products || [];

  return (
    <PageLayout>
      <MainContainer>
        <PageHeader
          badge="🛍️ Product Catalog"
          title="Quality Products at Great Prices"
          highlightedWord="Great Prices"
          description="Browse our curated selection of essential products. Join group orders to unlock bulk pricing and save even more on your favorite items."
        />

        {/* Products Grid */}
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Products Available"
            description="Products will appear here once they are added to our catalog."
            actionLabel="Seed Sample Products"
            onAction={handleSeedProducts}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                formatPrice={formatPrice}
                calculateDiscount={calculateDiscount}
              />
            ))}
          </div>
        )}
      </MainContainer>
    </PageLayout>
  );
}