import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Tag } from "lucide-react";
import Link from "next/link";
import { ProductCardProps } from "@/types";

export function ProductCard({ product, formatPrice, calculateDiscount }: ProductCardProps) {
  const discount = calculateDiscount(product.mrp, product.sellingPrice);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        {product.imageUrl ? (
          <img
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
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {product.unitSize} {product.unit}
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-green-600">
              {formatPrice(product.sellingPrice)}
            </span>
            {discount > 0 && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {product.category.name}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Min: {product.minOrderQty} {product.unit}
            {product.maxOrderQty && (
              <span className="ml-2">Max: {product.maxOrderQty} {product.unit}</span>
            )}
          </div>
          <Button size="sm" className="flex items-center space-x-1">
            <ShoppingCart className="h-4 w-4" />
            <span>Add to Cart</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}