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
      const result = await cartApi.getCart(cartId!);
      return result;
    },
    enabled: !!cartId,
    staleTime: 30000, // 30 seconds - data is fresh for 30s
    gcTime: 300000, // 5 minutes - keep in cache for 5 min
  });
};

/**
 * Hook to add item to cart
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AddToCartParams) => cartApi.addToCart(params),
    onSuccess: () => {
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

/**
 * Hook to update cart email
 */
export const useUpdateCartEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartId, email }: { cartId: string; email: string }) =>
      cartApi.updateCartEmail(cartId, email),
    onSuccess: (data, variables) => {
      // Update the specific cart in the cache
      queryClient.setQueryData(cartKeys.cart(variables.cartId), data);
    },
  });
};

/**
 * Hook to update cart shipping info
 */
export const useUpdateCartShipping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cartId,
      shippingData,
    }: {
      cartId: string;
      shippingData: {
        shippingMethod?: string;
        shippingOption?: string;
        isGift?: boolean;
      };
    }) => cartApi.updateCartShipping(cartId, shippingData),
    onSuccess: (data, variables) => {
      // Update the specific cart in the cache
      queryClient.setQueryData(cartKeys.cart(variables.cartId), data);
    },
  });
};

/**
 * Hook to update cart addresses
 */
export const useUpdateCartAddresses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cartId,
      addressData,
    }: {
      cartId: string;
      addressData: {
        shippingFirstName?: string;
        shippingLastName?: string;
        shippingAddress1?: string;
        shippingAddress2?: string;
        shippingCity?: string;
        shippingProvince?: string;
        shippingPostalCode?: string;
        shippingCountryCode?: string;
        shippingPhone?: string;
        billingFirstName?: string;
        billingLastName?: string;
        billingAddress1?: string;
        billingAddress2?: string;
        billingCity?: string;
        billingProvince?: string;
        billingPostalCode?: string;
        billingCountryCode?: string;
        billingPhone?: string;
        sameAddressForBilling?: boolean;
      };
    }) => cartApi.updateCartAddresses(cartId, addressData),
    onSuccess: (data, variables) => {
      // Update the specific cart in the cache
      queryClient.setQueryData(cartKeys.cart(variables.cartId), data);
    },
  });
};
