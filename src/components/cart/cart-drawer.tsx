"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CartIcon } from "./cart-icon";
import { useCartStore } from "@/stores/cart-store";
import { useSession } from "next-auth/react";
import { CartItem } from "@/types";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CartDrawerProps {
  className?: string;
}

export function CartDrawer({ className }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const { cart, updateCartItem, removeFromCart, clearCart, isLoading } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleQuantityChange = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < item.minOrderQty) return;
    if (item.maxOrderQty && newQuantity > item.maxOrderQty) return;

    await updateCartItem({
      itemId: item.id,
      quantity: newQuantity,
    });
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleCheckout = () => {
    setIsOpen(false);
    // Navigate to checkout page
    // router.push('/checkout');
  };

  if (!cart || cart.items.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <CartIcon onCartClick={() => setIsOpen(true)} className={className} />
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shopping Cart
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add some products to get started
            </p>
            <Button onClick={() => setIsOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <CartIcon onCartClick={() => setIsOpen(true)} className={className} />
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({cart.totalItems} items)
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {cart.items.map((item) => (
              <div key={item.id} className="mb-4 p-3 border rounded-lg">
                <div className="flex gap-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.unitSize} {item.unit}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={item.orderType === 'priority' ? 'default' : 'secondary'}>
                            {item.orderType === 'priority' ? 'Priority' : 'Group'}
                          </Badge>
                          {item.groupOrderId && (
                            <Badge variant="outline" className="text-xs">
                              Group Order
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm">
                        <span className="text-muted-foreground line-through">
                          {formatPrice(item.mrp)}
                        </span>
                        <span className="ml-2 font-semibold">
                          {formatPrice(item.sellingPrice)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          disabled={item.quantity <= item.minOrderQty || isLoading}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          disabled={item.maxOrderQty ? item.quantity >= item.maxOrderQty : false || isLoading}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right mt-2">
                      <span className="text-sm font-medium">
                        Total: {formatPrice(item.sellingPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="border-t pt-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span>-{formatPrice(cart.totalDiscount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>{formatPrice(cart.totalAmount)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleCheckout} 
                className="w-full"
                disabled={isLoading}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleClearCart}
                className="w-full"
                disabled={isLoading}
              >
                Clear Cart
              </Button>
            </div>

            {!session && (
              <div className="mt-4 p-3 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Guest user? Sign in to save your cart
                </p>
                <Link href="/auth/signin">
                  <Button variant="secondary" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 