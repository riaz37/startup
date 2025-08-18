import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ProductCardProps } from "@/types";
import { AddToCartButton } from "@/components/cart";
import { LazyImage } from "@/components/ui/lazy-load";

export function ProductCard({ product, formatPrice, calculateDiscount }: ProductCardProps) {
  const discount = calculateDiscount(product.mrp, product.sellingPrice);

  return (
    <Link href={`/products/${product.id}`} className="block">
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">
        <div className="relative">
          {product.imageUrl ? (
            <LazyImage
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {discount > 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white">
              {discount}% OFF
            </Badge>
          )}
          
          {/* View Details Indicator */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
              <ExternalLink className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {product.unitSize} {product.unit}
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(product.sellingPrice)}
                </span>
                {discount > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.mrp)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span className="text-xs text-green-600 font-medium">
                  Save {formatPrice(product.mrp - product.sellingPrice)}
                </span>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {product.category?.name || 'Uncategorized'}
            </Badge>
          </div>

          <div className="flex items-center justify-end mb-3">
            <div className="text-sm text-primary font-medium group-hover:text-primary/80 transition-colors">
              View Details →
            </div>
          </div>

          {/* Add to Cart Section */}
          <div className="border-t pt-3">
            <AddToCartButton
              product={product}
              orderType="priority"
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}