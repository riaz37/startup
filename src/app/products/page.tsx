import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { EmptyState } from "@/components/common";
import { ProductCard } from "@/components/products/product-card";
import { Package } from "lucide-react";
import { prisma } from "@/lib/database";
import { Product } from "@/types";

export default async function ProductsPage() {
  // Fetch products server-side
  let products: Product[] = [];
  let error: Error | null = null;
  
  try {
    const productsData = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the expected Product type
    products = productsData.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || undefined,
      mrp: product.mrp,
      sellingPrice: product.sellingPrice,
      unit: product.unit,
      unitSize: product.unitSize,
      minOrderQty: product.minOrderQty,
      maxOrderQty: product.maxOrderQty || undefined,
      imageUrl: product.imageUrl || undefined,
      categoryId: product.category.id,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
        description: product.category.description,
      },
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
  } catch (err) {
    error = err instanceof Error ? err : new Error('Failed to fetch products');
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (mrp: number, sellingPrice: number) => {
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  };

  if (error) {
    return (
      <PageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading products: {error.message}</p>
              <p className="text-gray-600">Please try refreshing the page or contact support if the problem persists.</p>
            </div>
          </div>
        </MainContainer>
      </PageLayout>
    );
  }

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
            actionHref="/api/seed"
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