// ============================================================================
// ANALYTICS REACT HOOKS
// ============================================================================

import { useCallback, useEffect } from "react";
import * as analyticsApi from "../api";
import * as cartApi from "@/features/cart/api";
import { getOrCreateSessionId } from "@/lib/session-manager";

/**
 * Hook to track product view
 * Returns a function that can be called to track a view
 */
export function useTrackProductView() {
  return useCallback(async (productId: string, variantId?: string) => {
    const sessionId = getOrCreateSessionId();

    // Ensure guest token exists (creates one via cart API if needed)
    const guestToken = await cartApi.getGuestToken();

    analyticsApi.trackProductView({
      productId,
      variantId,
      sessionId,
      guestToken,
      metadata: {
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      },
    });
  }, []);
}

/**
 * Hook to automatically track product view on mount
 * Use this in product detail pages
 */
export function useAutoTrackProductView(
  productId?: string,
  variantId?: string
) {
  const trackProductView = useTrackProductView();

  useEffect(() => {
    if (productId) {
      trackProductView(productId, variantId);
    }
  }, [productId, variantId, trackProductView]);
}

/**
 * Hook to track order purchase (complete order with all items)
 * Use this in checkout success page
 */
export function useTrackOrder() {
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

      // Get guest token from cart (already exists by checkout time)
      const guestToken = await cartApi.getGuestToken();

      analyticsApi.trackPurchase({
        orderId,
        orderItems: items,
        sessionId,
        totalAmount,
        guestToken,
      });
    },
    []
  );
}

/**
 * Hook to track add to cart
 */
export function useTrackAddToCart() {
  return useCallback(
    async (
      productId: string,
      variantId: string | undefined, // explicitly allow undefined
      quantity: number,
      price: number
    ) => {
      const sessionId = getOrCreateSessionId();
      const guestToken = await cartApi.getGuestToken();

      analyticsApi.trackAddToCart({
        productId,
        variantId,
        quantity,
        price,
        sessionId,
        guestToken,
        metadata: {
          referrer: document.referrer,
          userAgent: navigator.userAgent,
        },
      });
    },
    []
  );
}
