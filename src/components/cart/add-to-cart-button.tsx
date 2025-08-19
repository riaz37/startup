"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { useSession } from "next-auth/react";
import { Product } from "@/types";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

interface AddToCartButtonProps {
  product: Product;
  orderType: 'priority' | 'group';
  groupOrderId?: string;
  className?: string;
  compact?: boolean;
}

export function AddToCartButton({ 
  product, 
  orderType, 
  groupOrderId, 
  className,
  compact = false
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(Math.max(1, product.minOrderQty || 1));
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { addToCart } = useCartStore();

  // Ensure quantity is always valid
  const minQuantity = Math.max(1, product.minOrderQty || 1);
  const maxQuantity = product.maxOrderQty || 999;

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= minQuantity && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (quantity < product.minOrderQty) {
      toast.error(`Minimum order quantity is ${product.minOrderQty}`);
      return;
    }

    if (product.maxOrderQty && quantity > product.maxOrderQty) {
      toast.error(`Maximum order quantity is ${product.maxOrderQty}`);
      return;
    }

    if (orderType === 'group' && !groupOrderId) {
      toast.error('Group order ID is required');
      return;
    }

    // Debug logging
    console.log('Adding to cart with:', {
      productId: product.id,
      quantity,
      orderType,
      groupOrderId,
      product: product.name
    });

    // Validate required fields
    if (!product.id) {
      toast.error('Product ID is missing');
      return;
    }

    if (!quantity || quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (!orderType) {
      toast.error('Order type is required');
      return;
    }

    setIsLoading(true);
    try {
      await addToCart({
        productId: product.id,
        quantity,
        orderType,
        groupOrderId,
      });

      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getPrice = () => {
    return orderType === 'priority' ? product.mrp : product.sellingPrice;
  };

  const getDiscount = () => {
    if (orderType === 'priority') return 0;
    return Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);
  };

  // Compact version for product cards
  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Compact Quantity Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= product.minOrderQty}
              className="h-8 w-8"
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <span className="text-sm font-medium min-w-[2rem] text-center">
              {quantity}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(1)}
              disabled={product.maxOrderQty ? quantity >= product.maxOrderQty : false}
              className="h-8 w-8"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <span className="text-xs text-muted-foreground">
            Min: {product.minOrderQty} {product.unit}
          </span>
        </div>

        {/* Compact Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="w-full"
          size="sm"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              Adding...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </div>
          )}
        </Button>

        {/* Compact Order Type Info */}
        <div className="text-xs text-muted-foreground text-center">
          {orderType === 'priority' ? (
            <p>Priority orders delivered within 24-48 hours at MRP price</p>
          ) : (
            <p>Group orders unlock bulk pricing</p>
          )}
        </div>
      </div>
    );
  }

  // Full version for detailed views
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Price Display - Only show for group orders to avoid confusion */}
      {orderType === 'group' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{formatPrice(getPrice())}</span>
            {getDiscount() > 0 && (
              <Badge variant="secondary" className="text-sm">
                {getDiscount()}% OFF
              </Badge>
            )}
          </div>
          {getDiscount() > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              MRP: {formatPrice(product.mrp)}
            </span>
          )}
        </div>
      )}

      {/* Quantity Selector */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= product.minOrderQty}
            className="h-8 w-8"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= product.minOrderQty) {
                setQuantity(value);
              }
            }}
            min={product.minOrderQty}
            max={product.maxOrderQty}
            className="w-20 text-center"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(1)}
            disabled={product.maxOrderQty ? quantity >= product.maxOrderQty : false}
            className="h-8 w-8"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Min: {product.minOrderQty} {product.unit}
          {product.maxOrderQty && ` • Max: ${product.maxOrderQty} ${product.unit}`}
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Adding...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </div>
        )}
      </Button>

      {/* Order Type Info */}
      <div className="text-sm text-muted-foreground text-center">
        {orderType === 'priority' ? (
          <p>Priority orders are delivered within 24-48 hours at MRP price</p>
        ) : (
          <p>Group orders unlock bulk pricing and are delivered when threshold is met</p>
        )}
      </div>
    </div>
  );
} 