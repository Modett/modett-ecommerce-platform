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
    await apiClient.post("/analytics/events/capture-view", params);
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
    await apiClient.post("/analytics/events/capture-purchase", params);
  } catch (error) {
    // Silent fail - don't break user experience if analytics fails
    console.error("Failed to track purchase:", error);
  }
};

export interface TrackAddToCartParams {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  sessionId: string;
  userId?: string;
  guestToken?: string;
  metadata?: {
    referrer?: string;
    userAgent?: string;
  };
}

export interface TrackBeginCheckoutParams {
  cartId: string;
  cartTotal: number;
  itemCount: number;
  currency: string;
  sessionId: string;
  userId?: string;
  guestToken?: string;
  metadata?: {
    referrer?: string;
    userAgent?: string;
  };
}

/**
 * Track add to cart event
 */
export const trackAddToCart = async (
  params: TrackAddToCartParams
): Promise<void> => {
  try {
    await apiClient.post("/analytics/events/capture-add-to-cart", params);
  } catch (error) {
    // Silent fail
    console.error("Failed to track add to cart:", error);
  }
};

/**
 * Track begin checkout event
 */
export const trackBeginCheckout = async (
  params: TrackBeginCheckoutParams
): Promise<void> => {
  try {
    await apiClient.post("/analytics/events/capture-begin-checkout", params);
  } catch (error) {
    // Silent fail - don't break user experience if analytics fails
    console.error("Failed to track begin checkout:", error);
  }
};

export interface TrackAddShippingInfoParams {
  cartId: string;
  shippingMethod: string;
  shippingTier: string;
  cartTotal: number;
  itemCount: number;
  currency: string;
  sessionId: string;
  userId?: string;
  guestToken?: string;
  metadata?: {
    referrer?: string;
    userAgent?: string;
  };
}

export interface TrackAddPaymentInfoParams {
  cartId: string;
  paymentMethod: string;
  cartTotal: number;
  itemCount: number;
  currency: string;
  sessionId: string;
  userId?: string;
  guestToken?: string;
  metadata?: {
    referrer?: string;
    userAgent?: string;
  };
}

/**
 * Track add shipping info event
 */
export const trackAddShippingInfo = async (
  params: TrackAddShippingInfoParams
): Promise<void> => {
  try {
    await apiClient.post("/analytics/events/capture-add-shipping-info", params);
  } catch (error) {
    // Silent fail
    console.error("Failed to track add shipping info:", error);
  }
};

/**
 * Track add payment info event
 */
export const trackAddPaymentInfo = async (
  params: TrackAddPaymentInfoParams
): Promise<void> => {
  try {
    await apiClient.post("/analytics/events/capture-add-payment-info", params);
  } catch (error) {
    // Silent fail
    console.error("Failed to track add payment info:", error);
  }
};
