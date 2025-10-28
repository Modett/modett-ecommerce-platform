"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '@/services';
import type { ShoppingCart, CartItem, AddToCartInput } from '@/types';

interface CartContextType {
  cart: ShoppingCart | null;
  isLoading: boolean;
  addItem: (input: AddToCartInput) => Promise<{ success: boolean; message: string } | undefined>;
  updateItem: (variantId: string, qty: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  total: number;
}

const fallbackContext: CartContextType = {
  cart: null,
  isLoading: false,
  addItem: async (input) => {
    console.warn("useCart: addItem called outside CartProvider")
    return { success: false, message: "Cart not initialised" }
  },
  updateItem: async () => {
    console.warn("useCart: updateItem called outside CartProvider")
  },
  removeItem: async () => {
    console.warn("useCart: removeItem called outside CartProvider")
  },
  clearCart: async () => {
    console.warn("useCart: clearCart called outside CartProvider")
  },
  itemCount: 0,
  total: 0,
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ShoppingCart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      // For now, use guest cart (we'll add auth later)
      const guestCart = await cartService.getOrCreateGuestCart();
      setCart(guestCart);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (input: AddToCartInput) => {
    try {
      if (!cart) {
        await loadCart();
        if (!cart) {
          return { success: false, message: 'Cart not available' };
        }
      }

      setIsLoading(true);
      const newItem = await cartService.addItem(cart.id, input);

      // Reload cart to get updated state
      await loadCart();
      return { success: true, message: 'Item added to cart' };
    } catch (error: any) {
      console.error('Failed to add item to cart:', error);

      // Handle specific error cases
      let message = 'Unable to add item to cart';
      if (error?.status === 401) {
        message = 'Session conflict. Please clear your browser cookies or use incognito mode.';
      } else if (error?.status === 400) {
        message = 'This item is currently not available';
      } else if (error?.status === 404) {
        message = 'Product not found';
      } else if (error?.data?.error) {
        message = error.data.error;
      }

      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (variantId: string, qty: number) => {
    try {
      if (!cart) return;

      setIsLoading(true);
      await cartService.updateItem(cart.id, variantId, { qty });
      await loadCart();
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (variantId: string) => {
    try {
      if (!cart) return;

      setIsLoading(true);
      await cartService.removeItem(cart.id, variantId);
      await loadCart();
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      if (!cart) return;

      setIsLoading(true);
      await cartService.clearCart(cart.id);
      await loadCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = cart ? cartService.getItemCount(cart) : 0;
  const total = cart ? cartService.calculateTotal(cart) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === null) {
    return fallbackContext;
  }
  return context;
}
