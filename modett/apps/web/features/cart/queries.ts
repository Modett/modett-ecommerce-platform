// ============================================================================
// CART REACT QUERY HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as cartApi from "./api";
import type { AddToCartParams } from "./types";

/**
 * Query key factory for cart queries
 */
export const cartKeys = {
  all: ["cart"] as const,
  cart: (id: string) => ["cart", id] as const,
};

/**
 * Hook to fetch cart by ID
 */
export const useCart = (cartId: string | null) => {
  return useQuery({
    queryKey: cartKeys.cart(cartId || ""),
    queryFn: async () => {
      console.log('[useCart] Fetching cart for ID:', cartId);
      try {
        const result = await cartApi.getCart(cartId!);
        console.log('[useCart] Successfully fetched cart:', result);
        return result;
      } catch (error) {
        console.error('[useCart] Error fetching cart:', error);
        throw error;
      }
    },
    enabled: !!cartId,
    staleTime: 0,
    gcTime: 0,
  });
};

/**
 * Hook to add item to cart
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AddToCartParams) => cartApi.addToCart(params),
    onSuccess: (data) => {
      // Invalidate cart queries to refetch updated cart
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

/**
 * Hook to update cart item quantity
 */
export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cartId,
      variantId,
      quantity,
    }: {
      cartId: string;
      variantId: string;
      quantity: number;
    }) => cartApi.updateCartQuantity(cartId, variantId, quantity),
    onSuccess: (data, variables) => {
      // Update the specific cart in the cache
      queryClient.setQueryData(cartKeys.cart(variables.cartId), data);
    },
  });
};

/**
 * Hook to remove item from cart
 */
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cartId,
      variantId,
    }: {
      cartId: string;
      variantId: string;
    }) => cartApi.removeCartItem(cartId, variantId),
    onSuccess: (data, variables) => {
      // Update the specific cart in the cache
      queryClient.setQueryData(cartKeys.cart(variables.cartId), data);
    },
  });
};
