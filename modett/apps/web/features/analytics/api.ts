// ============================================================================
// ANALYTICS API
// ============================================================================

import { apiClient } from "@/lib/api-client";

export interface TrackProductViewParams {
  productId: string;
  variantId?: string;
  sessionId: string;
  userId?: string;
  guestToken?: string;
  metadata?: {
    referrer?: string;
    userAgent?: string;
  };
}

export interface TrackPurchaseParams {
  orderId: string;
  orderItems: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
  }>;
  sessionId: string;
  totalAmount: number;
  userId?: string;
  guestToken?: string;
}

/**
 * Track product view event
 */
export const trackProductView = async (
  params: TrackProductViewParams
): Promise<void> => {
  try {
    await apiClient.post("/analytics/track/product-view", params);
  } catch (error) {
    // Silent fail - don't break user experience if analytics fails
    console.error("Failed to track product view:", error);
  }
};

/**
 * Track purchase event (order-level tracking)
 */
export const trackPurchase = async (
  params: TrackPurchaseParams
): Promise<void> => {
  try {
    await apiClient.post("/analytics/track/purchase", params);
  } catch (error) {
    // Silent fail - don't break user experience if analytics fails
    console.error("Failed to track purchase:", error);
  }
};
