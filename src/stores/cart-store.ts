import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '@/types';
import { useSession } from 'next-auth/react';
import React from 'react'; // Added missing import for React

interface CartStore {
  // State
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;

  // Actions
  initializeCart: (userId?: string, sessionId?: string) => Promise<void>;
  addToCart: (request: AddToCartRequest) => Promise<void>;
  updateCartItem: (request: UpdateCartItemRequest) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeGuestCart: (sessionId: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Generate a unique session ID for guest users
const generateSessionId = (): string => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get session ID from cookies or generate new one
const getOrCreateSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  // Try to get from cookies first
  const cookies = document.cookie.split(';');
  const guestSessionCookie = cookies.find(cookie => 
    cookie.trim().startsWith('guest-session-id=')
  );
  
  if (guestSessionCookie) {
    return guestSessionCookie.split('=')[1];
  }
  
  // Generate new session ID and set as cookie
  const sessionId = generateSessionId();
  document.cookie = `guest-session-id=${sessionId}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  return sessionId;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      isLoading: false,
      error: null,
      sessionId: null,

      // Initialize cart
      initializeCart: async (userId?: string, sessionId?: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const guestSessionId = sessionId || getOrCreateSessionId();
          set({ sessionId: guestSessionId });

          const headers: Record<string, string> = {};
          if (!userId) {
            headers['x-session-id'] = guestSessionId;
          }

          const response = await fetch('/api/cart', {
            method: 'GET',
            headers,
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to fetch cart');
          }

          const data = await response.json();
          set({ cart: data.cart, isLoading: false });
        } catch (error) {
          console.error('Error initializing cart:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to initialize cart',
            isLoading: false 
          });
        }
      },

      // Add item to cart
      addToCart: async (request: AddToCartRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const { cart, sessionId } = get();
          const guestSessionId = sessionId || getOrCreateSessionId();
          
          const headers: Record<string, string> = {};
          if (!cart?.userId) {
            headers['x-session-id'] = guestSessionId;
          }

          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: JSON.stringify(request),
            credentials: 'include',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add item to cart');
          }

          const data = await response.json();
          set({ cart: data.cart, isLoading: false });
        } catch (error) {
          console.error('Error adding to cart:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add item to cart',
            isLoading: false 
          });
        }
      },

      // Update cart item
      updateCartItem: async (request: UpdateCartItemRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const { cart, sessionId } = get();
          const guestSessionId = sessionId || getOrCreateSessionId();
          
          const headers: Record<string, string> = {};
          if (!cart?.userId) {
            headers['x-session-id'] = guestSessionId;
          }

          const response = await fetch('/api/cart', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: JSON.stringify(request),
            credentials: 'include',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update cart item');
          }

          const data = await response.json();
          set({ cart: data.cart, isLoading: false });
        } catch (error) {
          console.error('Error updating cart item:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update cart item',
            isLoading: false 
          });
        }
      },

      // Remove item from cart
      removeFromCart: async (itemId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const { cart, sessionId } = get();
          const guestSessionId = sessionId || getOrCreateSessionId();
          
          const headers: Record<string, string> = {};
          if (!cart?.userId) {
            headers['x-session-id'] = guestSessionId;
          }

          const response = await fetch(`/api/cart?itemId=${itemId}`, {
            method: 'DELETE',
            headers,
            credentials: 'include',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove cart item');
          }

          const data = await response.json();
          set({ cart: data.cart, isLoading: false });
        } catch (error) {
          console.error('Error removing cart item:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to remove cart item',
            isLoading: false 
          });
        }
      },

      // Clear cart
      clearCart: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const { cart, sessionId } = get();
          const guestSessionId = sessionId || getOrCreateSessionId();
          
          const headers: Record<string, string> = {};
          if (!cart?.userId) {
            headers['x-session-id'] = guestSessionId;
          }

          // Clear all items one by one (or implement a clear endpoint)
          if (cart?.items) {
            for (const item of cart.items) {
              await get().removeFromCart(item.id);
            }
          }

          set({ isLoading: false });
        } catch (error) {
          console.error('Error clearing cart:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to clear cart',
            isLoading: false 
          });
        }
      },

      // Merge guest cart with user cart
      mergeGuestCart: async (sessionId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('/api/cart/merge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
            credentials: 'include',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to merge cart');
          }

          const data = await response.json();
          set({ 
            cart: data.cart, 
            sessionId: null,
            isLoading: false 
          });

          // Clear guest session cookie
          if (typeof window !== 'undefined') {
            document.cookie = 'guest-session-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        } catch (error) {
          console.error('Error merging cart:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to merge cart',
            isLoading: false 
          });
        }
      },

      // Set error
      setError: (error: string | null) => set({ error }),
      
      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => {
        // Custom storage that uses cookies instead of localStorage
        return {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null;
            const cookies = document.cookie.split(';');
            const cookie = cookies.find(c => c.trim().startsWith(`${key}=`));
            return cookie ? cookie.split('=')[1] : null;
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return;
            document.cookie = `${key}=${value}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return;
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          },
        };
      }),
      partialize: (state) => ({
        sessionId: state.sessionId,
      }),
    }
  )
);

// Hook to automatically merge guest cart when user logs in
export const useCartSync = () => {
  const { data: session } = useSession();
  const { cart, sessionId, mergeGuestCart } = useCartStore();

  // Merge guest cart when user logs in
  React.useEffect(() => {
    if (session?.user?.id && sessionId && !cart?.userId) {
      mergeGuestCart(sessionId);
    }
  }, [session?.user?.id, sessionId, cart?.userId, mergeGuestCart]);
}; 