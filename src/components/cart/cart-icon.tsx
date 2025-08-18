"use client";

import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

interface CartIconProps {
  onCartClick: () => void;
  className?: string;
}

export function CartIcon({ onCartClick, className }: CartIconProps) {
  const { data: session } = useSession();
  const { cart, initializeCart, sessionId } = useCartStore();

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

  const itemCount = cart?.totalItems || 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onCartClick}
      className={`relative ${className}`}
      aria-label="Shopping cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </Badge>
      )}
    </Button>
  );
} 