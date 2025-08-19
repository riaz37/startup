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
    <Card className="mobile-card group hover:shadow-lg transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">
      {/* Product Image Section */}
      <div className="relative">
        <Link href={`/products/${product.id}`} className="block">
          {product.imageUrl ? (
            <LazyImage
              src={product.imageUrl}
              alt={product.name}
              className="img-responsive-square w-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="img-responsive-square w-full bg-gray-200 flex items-center justify-center">
              <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
            </div>
          )}
          
          {/* Discount Badge */}
          {discount > 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white font-semibold text-responsive-xs sm:text-responsive-sm">
              {discount}% OFF
            </Badge>
          )}
          
          {/* Category Badge */}
          <Badge 
            variant="outline" 
            className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm border-primary/20 text-primary font-medium text-responsive-xs sm:text-responsive-sm"
          >
            {product.category?.name || 'Uncategorized'}
          </Badge>
          
          {/* Group Order Badge - Overlay on image */}
          {!groupOrderLoading && groupOrderData?.hasGroupOrders && (
            <Badge className="absolute bottom-2 left-2 bg-purple-500/90 backdrop-blur-sm text-white font-medium text-responsive-xs sm:text-responsive-sm border border-purple-300/50">
              <Users className="h-3 w-3 mr-1" />
              {groupOrderData.count} Group Order{groupOrderData.count !== 1 ? 's' : ''}
            </Badge>
          )}
          
          {/* View Details Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2 sm:p-3">
              <ExternalLink className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
        </Link>
      </div>

      <CardContent className="p-3 sm:p-4">
        {/* Product Information */}
        <div className="mb-3 sm:mb-4">
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-semibold text-responsive-base sm:text-responsive-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
              {product.name}
            </h3>
            <p className="text-responsive-xs sm:text-responsive-sm text-gray-600 mb-2 sm:mb-3">
              {product.unitSize} {product.unit}
            </p>
          </Link>

          {/* Pricing Section */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-responsive-lg sm:text-responsive-xl font-bold text-green-600">
                  {formatPrice(product.sellingPrice)}
                </span>
                {discount > 0 && (
                  <span className="text-responsive-xs sm:text-responsive-sm text-gray-500 line-through">
                    {formatPrice(product.mrp)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span className="text-responsive-xs text-green-600 font-medium">
                  Save {formatPrice(product.mrp - product.sellingPrice)}
                </span>
              )}
            </div>
            
            {/* View Details Link */}
            <Link 
              href={`/products/${product.id}`}
              className="text-responsive-xs sm:text-responsive-sm text-primary font-medium hover:text-primary/80 transition-colors flex items-center gap-1 mobile-touch-target"
            >
              View Details
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Add to Cart Section */}
          <AddToCartButton 
            product={product} 
            orderType="priority"
            className="w-full mobile-touch-target text-responsive-sm sm:text-responsive-base"
            compact={true}
          />
          
          {/* Group Order Status - Subtle text below cart button */}
          {!groupOrderLoading && groupOrderData?.hasGroupOrders && (
            <div className="text-center pt-1">
              <div className="flex items-center justify-center space-x-1 text-responsive-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span className="text-purple-600 font-medium">
                  {groupOrderData.count} active group order{groupOrderData.count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}