import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Tag } from "lucide-react";
import Link from "next/link";

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

interface ProductCardProps {
  product: Product;
  formatPrice: (price: number) => string;
  calculateDiscount: (mrp: number, sellingPrice: number) => number;
}

export function ProductCard({ product, formatPrice, calculateDiscount }: ProductCardProps) {
  return (
    <Card className="card-hover overflow-hidden">
      <div className="aspect-square w-full overflow-hidden bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary">
            {product.category.name}
          </Badge>
          {calculateDiscount(product.mrp, product.sellingPrice) > 0 && (
            <Badge className="badge-success">
              <Tag className="h-3 w-3 mr-1" />
              {calculateDiscount(product.mrp, product.sellingPrice)}% OFF
            </Badge>
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3">
          {product.unitSize} {product.unit}
        </p>
        
        {product.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.sellingPrice)}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mb-4 p-2 bg-muted/50 rounded">
          Min: {product.minOrderQty} {product.unit}
          {product.maxOrderQty && (
            <span> • Max: {product.maxOrderQty} {product.unit}</span>
          )}
        </div>
        
        <Button className="w-full" asChild>
          <Link href={`/products/${product.id}`}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}