// ============================================================================
// ANALYTICS REACT HOOKS
// ============================================================================

import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import * as analyticsApi from "../api";
import * as cartApi from "@/features/cart/api";
import { getOrCreateSessionId } from "@/lib/session-manager";
import { useAuth } from "@/providers/AuthProvider";

/**
 * Hook to track product view
 * Returns a function that can be called to track a view
 */
export function useTrackProductView() {
  const { user, isLoading } = useAuth();

  const track = useCallback(
    async (productId: string, variantId?: string) => {
      const sessionId = getOrCreateSessionId();

      // Only get guest token if user ID is not available
      // This ensures we always have either userId or guestToken for the backend
      const guestToken = user?.id ? undefined : await cartApi.getGuestToken();

      analyticsApi.trackProductView({
        productId,
        variantId,
        sessionId,
        guestToken,
        userId: user?.id,
        metadata: {
          referrer: document.referrer,
          userAgent: navigator.userAgent,
        },
      });
    },
    [user]
  );

  return { track, isLoading };
}

/**
 * Hook to automatically track product view on mount
 * Use this in product detail pages
 */
export function useAutoTrackProductView(
  productId?: string,
  variantId?: string
) {
  const { track: trackProductView, isLoading } = useTrackProductView();
  const { user } = useAuth();
  const trackedProductIdRef = useRef<string | null>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Wait for auth to initialize so we have the userId
    if (isLoading) return;

    // Only track once we have either a user or confirmed there's no user
    // This prevents tracking with guest token when user is still loading
    if (
      !hasTrackedRef.current &&
      productId &&
      trackedProductIdRef.current !== productId
    ) {
      trackProductView(productId, variantId);
      trackedProductIdRef.current = productId;
      hasTrackedRef.current = true;
    }
  }, [productId, variantId, trackProductView, isLoading, user]);
}

/**
 * Hook to track order purchase (complete order with all items)
 * Use this in checkout success page
 */
export function useTrackOrder() {
  const { user, isLoading } = useAuth();

  return useCallback(
    async (
      orderId: string,
      items: Array<{
        productId: string;
        variantId?: string;
        quantity: number;
        price: number;
      }>,
      totalAmount: number
    ) => {
      const sessionId = getOrCreateSessionId();

      // Only get guest token if user ID is not available
      // This ensures we always have either userId or guestToken for the backend
      const guestToken = user?.id ? undefined : await cartApi.getGuestToken();

      analyticsApi.trackPurchase({
        orderId,
        orderItems: items,
        sessionId,
        totalAmount,
        guestToken,
        userId: user?.id,
      });
    },
    [user, isLoading]
  );
}

/**
 * Hook to track add to cart
 */
export function useTrackAddToCart() {
  const { user } = useAuth();

  return useCallback(
    async (
      productId: string,
      variantId: string | undefined, // explicitly allow undefined
      quantity: number,
      price: number
    ) => {
      const sessionId = getOrCreateSessionId();

      // Only get guest token if user ID is not available
      // This ensures we always have either userId or guestToken for the backend
      const guestToken = user?.id ? undefined : await cartApi.getGuestToken();

      analyticsApi.trackAddToCart({
        productId,
        variantId,
        quantity,
        price,
        sessionId,
        guestToken,
        userId: user?.id,
        metadata: {
          referrer: document.referrer,
          userAgent: navigator.userAgent,
        },
      });
    },
    [user]
  );
}
/**
 * Hook to track begin checkout
 */
export function useTrackBeginCheckout() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      params: Omit<
        analyticsApi.TrackBeginCheckoutParams,
        "sessionId" | "guestToken" | "userId"
      >
    ) => {
      const sessionId = getOrCreateSessionId();

      // Only get guest token if user ID is not available
      // This ensures we always have either userId or guestToken for the backend
      const guestToken = user?.id ? undefined : await cartApi.getGuestToken();

      return analyticsApi.trackBeginCheckout({
        ...params,
        sessionId,
        guestToken,
        userId: user?.id,
      });
    },
    onError: (error) => {
      console.warn("Failed to track begin checkout:", error);
    },
  });
}

/**
 * Hook to track add shipping info
 */
export function useTrackAddShippingInfo() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      params: Omit<
        analyticsApi.TrackAddShippingInfoParams,
        "sessionId" | "guestToken" | "userId"
      >
    ) => {
      const sessionId = getOrCreateSessionId();

      // Only get guest token if user ID is not available
      // This ensures we always have either userId or guestToken for the backend
      const guestToken = user?.id ? undefined : await cartApi.getGuestToken();

      return analyticsApi.trackAddShippingInfo({
        ...params,
        sessionId,
        guestToken,
        userId: user?.id,
      });
    },
    onError: (error) => {
      console.warn("Failed to track add shipping info:", error);
    },
  });
}

/**
 * Hook to track add payment info
 */
export function useTrackAddPaymentInfo() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      params: Omit<
        analyticsApi.TrackAddPaymentInfoParams,
        "sessionId" | "guestToken" | "userId"
      >
    ) => {
      const sessionId = getOrCreateSessionId();

      // Only get guest token if user ID is not available
      // This ensures we always have either userId or guestToken for the backend
      const guestToken = user?.id ? undefined : await cartApi.getGuestToken();

      return analyticsApi.trackAddPaymentInfo({
        ...params,
        sessionId,
        guestToken,
        userId: user?.id,
      });
    },
    onError: (error) => {
      console.warn("Failed to track add payment info:", error);
    },
  });
}
