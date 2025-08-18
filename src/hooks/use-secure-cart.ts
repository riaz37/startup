"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/stores/cart-store';
import { getSecureSession } from '@/lib/auth/session-utils';
import { Cart, AddToCartRequest, UpdateCartItemRequest } from '@/types';

/**
 * Secure cart hook that automatically handles authentication
 * and merges guest carts when users log in
 */
export const useSecureCart = () => {
  const { data: session, status } = useSession();
  const { 
    cart, 
    initializeCart, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    isLoading,
    error,
    clearError 
  } = useCartStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart when component mounts or session changes
  useEffect(() => {
    const initCart = async () => {
      if (status === 'loading') return;

      try {
        if (session?.user?.id) {
          // User is authenticated - initialize with user ID
          await initializeCart(session.user.id);
        } else {
          // User is not authenticated - initialize as guest
          await initializeCart();
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing cart:', error);
      }
    };

    initCart();
  }, [session?.user?.id, status, initializeCart]);

  // Auto-merge guest cart when user logs in
  useEffect(() => {
    const mergeGuestCart = async () => {
      if (status === 'authenticated' && session?.user?.id && cart && !cart.userId) {
        try {
          // This will be handled by the cart store's merge functionality
          console.log('Guest cart will be merged automatically');
        } catch (error) {
          console.error('Error merging guest cart:', error);
        }
      }
    };

    if (isInitialized) {
      mergeGuestCart();
    }
  }, [status, session?.user?.id, cart, isInitialized]);

  // Secure cart operations
  const secureAddToCart = async (request: AddToCartRequest) => {
    try {
      clearError();
      await addToCart(request);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const secureUpdateCartItem = async (request: UpdateCartItemRequest) => {
    try {
      clearError();
      await updateCartItem(request);
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  const secureRemoveFromCart = async (itemId: string) => {
    try {
      clearError();
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  };

  const secureClearCart = async () => {
    try {
      clearError();
      await clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  return {
    // Cart state
    cart,
    isLoading,
    error,
    
    // Cart actions
    addToCart: secureAddToCart,
    updateCartItem: secureUpdateCartItem,
    removeFromCart: secureRemoveFromCart,
    clearCart: secureClearCart,
    clearError,
    
    // Authentication state
    isAuthenticated: status === 'authenticated',
    isGuest: status === 'unauthenticated',
    authLoading: status === 'loading',
    isInitialized,
    
    // User info
    user: session?.user,
  };
}; 