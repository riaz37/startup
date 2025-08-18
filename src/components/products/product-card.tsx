import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ExternalLink, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";
import { ProductCardProps } from "@/types";
import { AddToCartButton } from "@/components/cart";
import { LazyImage } from "@/components/ui/lazy-load";
import { useProductGroupOrdersAvailable } from "@/hooks/api/use-group-orders";
import { Button } from "@/components/ui/button";
import { GroupOrderIndicator } from "./group-order-indicator";

export function ProductCard({ product, formatPrice, calculateDiscount }: ProductCardProps) {
  const discount = calculateDiscount(product.mrp, product.sellingPrice);
  const { data: groupOrderData, isLoading: groupOrderLoading } = useProductGroupOrdersAvailable(product.id);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">
      {/* Product Image Section */}
      <div className="relative">
        <Link href={`/products/${product.id}`} className="block">
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
          
          {/* Discount Badge */}
          {discount > 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white font-semibold">
              {discount}% OFF
            </Badge>
          )}
          
          {/* Category Badge */}
          <Badge 
            variant="outline" 
            className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm border-primary/20 text-primary font-medium"
          >
            {product.category?.name || 'Uncategorized'}
          </Badge>
          
          {/* Group Order Indicator */}
          <div className="absolute bottom-2 left-2">
            <GroupOrderIndicator productId={product.id} />
          </div>
          
          {/* View Details Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
              <ExternalLink className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Link>
      </div>

      <CardContent className="p-4">
        {/* Product Information */}
        <div className="mb-4">
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {product.unitSize} {product.unit}
            </p>
          </Link>

          {/* Pricing Section */}
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
            
            {/* View Details Link */}
            <Link 
              href={`/products/${product.id}`}
              className="text-sm text-primary font-medium hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              View Details
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Group Order Button - Show when available */}
        {!groupOrderLoading && groupOrderData?.hasGroupOrders && (
          <div className="mb-3">
            <Button 
              asChild 
              variant="outline" 
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              size="sm"
            >
              <Link href={`/products/${product.id}`}>
                <Users className="h-4 w-4 mr-2" />
                Join Group Order ({groupOrderData.count} available)
              </Link>
            </Button>
          </div>
        )}

        {/* Add to Cart Section - Integrated Design */}
        <div className="border-t pt-4">
          <AddToCartButton
            product={product}
            orderType="priority"
            className="text-sm"
            compact={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}