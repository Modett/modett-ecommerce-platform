import { apiClient } from "./api-client";

// ============================================================================
// Types
// ============================================================================

export interface OrderItem {
  orderItemId: string;
  variantId: string;
  quantity: number;
  productSnapshot: {
    productId: string;
    variantId: string;
    sku: string;
    name: string;
    variantName?: string;
    price: number;
    imageUrl?: string;
    weight?: number;
    dimensions?: Record<string, any>;
    attributes?: Record<string, any>;
  };
  isGift: boolean;
  giftMessage?: string;
  subtotal: number;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface OrderShipment {
  shipmentId: string;
  orderId: string;
  carrier?: string;
  service?: string;
  trackingNumber?: string;
  giftReceipt: boolean;
  pickupLocationId?: string;
  shippedAt?: string;
  deliveredAt?: string;
  isShipped: boolean;
  isDelivered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetails {
  orderId: string;
  orderNumber: string;
  userId?: string;
  guestToken?: string;
  status: string;
  source: string;
  currency: string;
  items: OrderItem[];
  totals: OrderTotals;
  shipments?: OrderShipment[];
  billingAddress?: OrderAddress;
  shippingAddress?: OrderAddress;
  createdAt: string;
  updatedAt: string;
}

export interface TrackOrderParams {
  orderNumber?: string;
  contact?: string; // email or phone
  trackingNumber?: string;
}

export interface TrackOrderResponse {
  success: boolean;
  data?: OrderDetails;
  error?: string;
  message?: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Track an order publicly without authentication
 * Requires either:
 * - orderNumber + contact (email or phone)
 * - trackingNumber
 */
export const trackOrder = async (
  params: TrackOrderParams
): Promise<TrackOrderResponse> => {
  try {
    const response = await apiClient.get<TrackOrderResponse>("/orders/track", {
      params,
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      // API returned an error response
      return {
        success: false,
        error: error.response.data?.error || "Failed to track order",
        message: error.response.data?.message || "Please try again",
      };
    }

    // Network error or other issue
    return {
      success: false,
      error: "Network Error",
      message:
        "Unable to connect to the server. Please check your connection and try again.",
    };
  }
};

/**
 * Get order by ID (requires authentication)
 */
export const getOrderById = async (
  orderId: string
): Promise<TrackOrderResponse> => {
  try {
    const response = await apiClient.get<TrackOrderResponse>(
      `/orders/${orderId}`
    );

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to get order",
      message: error.response?.data?.message || "Please try again",
    };
  }
};

/**
 * Get order by order number (requires authentication)
 */
export const getOrderByNumber = async (
  orderNumber: string
): Promise<TrackOrderResponse> => {
  try {
    const response = await apiClient.get<TrackOrderResponse>(
      `/orders/number/${orderNumber}`
    );

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to get order",
      message: error.response?.data?.message || "Please try again",
    };
  }
};
