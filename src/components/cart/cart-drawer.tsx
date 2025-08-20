"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X, Trash2, CreditCard } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/lib/utils";
import { LazyImage } from "@/components/ui/lazy-load";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const { cart, removeFromCart, updateCartItem, clearCart, initializeCart, sessionId } = useCartStore();

  // Initialize cart when component mounts
  useEffect(() => {
    if (session?.user?.id) {
      initializeCart(session.user.id);
    } else if (sessionId) {
      initializeCart(undefined, sessionId);
    } else {
      initializeCart();
    }
  }, [session?.user?.id, sessionId, initializeCart]);

  const items = cart?.items || [];
  const totalItems = cart?.totalItems || 0;
  const totalPrice = cart?.totalAmount || 0;

  // Debug logging
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      console.log('Cart items:', cart.items);
      console.log('First item details:', cart.items[0]);
    }
  }, [cart]);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartItem({ itemId: productId, quantity: newQuantity });
    }
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/checkout';
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative mobile-touch-target">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-responsive-xs"
            >
              {totalItems > 99 ? '99+' : totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="cart-drawer-responsive w-full sm:w-[400px] lg:w-[500px] xl:w-[600px]"
      >
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-responsive-lg sm:text-responsive-xl">
            Shopping Cart ({totalItems} items)
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 px-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-responsive-lg font-medium text-muted-foreground mb-2">
                Your cart is empty
              </h3>
              <p className="text-responsive-sm text-muted-foreground">
                Add some products to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {item.imageUrl ? (
                      <LazyImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-md flex items-center justify-center">
                        <span className="text-muted-foreground text-responsive-xs">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-responsive-sm sm:text-responsive-base font-medium text-foreground truncate">
                      {item.name || `Product ${item.productId.slice(-4)}`}
                    </h4>
                    <p className="text-responsive-xs sm:text-responsive-sm text-muted-foreground">
                      {item.unitSize || 0} {item.unit || 'unit'}
                    </p>
                    <p className="text-responsive-sm sm:text-responsive-base font-semibold text-primary">
                      {formatPrice(item.sellingPrice || 0)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="mobile-touch-target h-8 w-8 p-0"
                    >
                      -
                    </Button>
                    <span className="text-responsive-sm font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="mobile-touch-target h-8 w-8 p-0"
                    >
                      +
                    </Button>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="mobile-touch-target h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {items.length > 0 && (
          <div className="border-t pt-6 pb-6 px-6 space-y-6">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-responsive-lg font-semibold">Total:</span>
              <span className="text-responsive-xl font-bold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleCheckout} 
                className="w-full mobile-touch-target text-responsive-base sm:text-responsive-lg py-3 bg-primary hover:bg-primary/90"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Checkout
              </Button>
              <Button 
                variant="outline" 
                onClick={clearCart}
                className="w-full mobile-touch-target"
              >
                Clear Cart
              </Button>
            </div>
            
            {/* Info */}
            <p className="text-xs text-muted-foreground text-center">
              Priority orders are delivered within 24-48 hours
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
} 