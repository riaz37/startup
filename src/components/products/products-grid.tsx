import { ProductCard } from "./product-card";
import { Product } from "@/types";

interface ProductsGridProps {
  products: Product[];
  formatPrice: (price: number) => string;
  calculateDiscount: (mrp: number, sellingPrice: number) => number;
}

export function ProductsGrid({ products, formatPrice, calculateDiscount }: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-responsive-lg text-muted-foreground mb-4">
          No products found
        </div>
        <p className="text-responsive-sm text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="products-grid-responsive">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          formatPrice={formatPrice}
          calculateDiscount={calculateDiscount}
        />
      ))}
    </div>
  );
} 