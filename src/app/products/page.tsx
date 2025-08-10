import { getCurrentUser } from "@/lib/auth-utils";
import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { EmptyState } from "@/components/common";
import { ProductCard } from "@/components/products/product-card";
import { Package, Zap } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  unitSize: number;
  mrp: number;
  sellingPrice: number;
  minOrderQty: number;
  maxOrderQty: number | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

async function getProducts(): Promise<ProductsResponse> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  
  try {
    const response = await fetch(`${baseUrl}/api/products`, {
      cache: "no-store"
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 }
    };
  }
}

export default async function ProductsPage() {
  const user = await getCurrentUser();
  const { products } = await getProducts();

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
            onAction={() => {
              fetch("/api/seed", { method: "POST" })
                .then(() => window.location.reload())
                .catch(console.error);
            }}
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