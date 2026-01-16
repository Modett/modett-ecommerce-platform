// ============================================================================
// CART API
// ============================================================================

import axios from "axios";
import type { AddToCartParams, Cart } from "./types";
import { getStoredGuestToken, persistGuestToken, persistCartId } from "./utils";

// Create axios instance for cart API
import { config } from "@/lib/config";

// Create axios instance for cart API
// Use the shared configuration but append /cart for this specific client
const cartApiClient = axios.create({
  baseURL: `${config.apiUrl}/cart`,
  timeout: config.apiTimeout,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

/**
 * Get authentication headers (either Bearer token or Guest token)
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  // Check if user is authenticated
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  if (authToken) {
    // Authenticated user - use Bearer token
    return {
      Authorization: `Bearer ${authToken}`,
    };
  }

  // Guest user - use guest token
  const guestToken = await getGuestToken();
  return {
    "X-Guest-Token": guestToken,
  };
};

/**
 * Generate a guest token for cart operations
 */
export const generateGuestToken = async (): Promise<string> => {
  try {
    const { data } = await cartApiClient.get("/generate-guest-token");
    const token = data.data.guestToken;

    // Store in localStorage
    persistGuestToken(token);

    return token;
  } catch (error) {
    throw error;
  }
};

// Promise cache to prevent race conditions
let guestTokenPromise: Promise<string> | null = null;

/**
 * Get or generate guest token
 */
export const getGuestToken = async (): Promise<string> => {
  const storedToken = getStoredGuestToken();
  if (storedToken) {
    return storedToken;
  }

  // If a request is already in progress, return that promise
  if (guestTokenPromise) {
    return guestTokenPromise;
  }

  // Start new request and cache the promise
  guestTokenPromise = generateGuestToken().finally(() => {
    // Clear cache when done (success or failure)
    guestTokenPromise = null;
  });

  return guestTokenPromise;
};

/**
 * Add item to cart
 */
export const addToCart = async (params: AddToCartParams): Promise<Cart> => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await cartApiClient.post(
      "/cart/items",
      {
        variantId: params.variantId,
        quantity: params.quantity,
        isGift: params.isGift || false,
        giftMessage: params.giftMessage,
      },
      { headers }
    );

    if (data?.data?.cartId) {
      persistCartId(data.data.cartId);
    }

    return data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.errors?.[0] ||
      error.response?.data?.error ||
      "Failed to add item to cart";
    throw new Error(message);
  }
};

/**
 * Get cart by ID
 */
export const getCart = async (cartId: string): Promise<Cart> => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await cartApiClient.get(`/carts/${cartId}`, { headers });

    if (data?.data?.cartId) {
      persistCartId(data.data.cartId);
    }

    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to get cart");
  }
};

/**
 * Update cart item quantity
 */
export const updateCartQuantity = async (
  cartId: string,
  variantId: string,
  quantity: number
): Promise<Cart> => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await cartApiClient.put(
      `/carts/${cartId}/items/${variantId}`,
      { quantity },
      { headers }
    );

    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to update cart item"
    );
  }
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (
  cartId: string,
  variantId: string
): Promise<Cart> => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await cartApiClient.delete(
      `/carts/${cartId}/items/${variantId}`,
      { headers }
    );

    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to remove cart item"
    );
  }
};

/**
 * Transfer guest cart to user after login
 */
export const transferGuestCartToUser = async (
  guestToken: string,
  userId: string,
  userAuthToken: string,
  mergeWithExisting: boolean = true
): Promise<Cart> => {
  try {
    const { data } = await cartApiClient.post(
      `/guests/${guestToken}/cart/transfer`,
      {
        userId,
        mergeWithExisting,
      },
      {
        headers: {
          Authorization: `Bearer ${userAuthToken}`,
        },
      }
    );

    if (data?.data?.cartId) {
      persistCartId(data.data.cartId);
    }

    return data.data;
  } catch (error: any) {
    // Preserve the original error message for proper error handling downstream
    const errorMessage =
      error.response?.data?.error || error.message || "Failed to transfer cart";
    const newError = new Error(errorMessage);
    // Preserve status code for better error handling
    (newError as any).statusCode = error.response?.status;
    throw newError;
  }
};

/**
 * Update cart email
 */
export const updateCartEmail = async (
  cartId: string,
  email: string
): Promise<Cart> => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await cartApiClient.patch(
      `/carts/${cartId}/email`,
      { email },
      { headers }
    );

    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to update cart email"
    );
  }
};

/**
 * Update cart shipping info
 */
export const updateCartShipping = async (
  cartId: string,
  shippingData: {
    shippingMethod?: string;
    shippingOption?: string;
    isGift?: boolean;
  }
): Promise<Cart> => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await cartApiClient.patch(
      `/carts/${cartId}/shipping`,
      shippingData,
      { headers }
    );

    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to update cart shipping"
    );
  }
};

/**
 * Update cart addresses
 */
export const updateCartAddresses = async (
  cartId: string,
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
  }
): Promise<Cart> => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await cartApiClient.patch(
      `/carts/${cartId}/addresses`,
      addressData,
      { headers }
    );

    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to update cart addresses"
    );
  }
};

// ============================================================================
// CHECKOUT API
// ============================================================================

/**
 * Initialize checkout from cart
 */
export const initializeCheckout = async (
  cartId: string
): Promise<{ checkoutId: string; expiresAt: string }> => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await cartApiClient.post(
      `/checkout/initialize`,
      { cartId, expiresInMinutes: 120 }, // Extended to 2 hours for development
      { headers }
    );

    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to initialize checkout"
    );
  }
};

/**
 * Get checkout details
 */
export const getCheckout = async (checkoutId: string): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await cartApiClient.get(`/checkout/${checkoutId}`, {
      headers,
    });

    return data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to get checkout");
  }
};

/**
 * Complete checkout with order creation
 */
export const completeCheckoutWithOrder = async (
  checkoutId: string,
  paymentIntentId: string,
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    phone?: string;
  },
  billingAddress?: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    phone?: string;
  }
): Promise<any> => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await cartApiClient.post(
      `/checkout/${checkoutId}/complete-with-order`,
      {
        paymentIntentId,
        shippingAddress,
        billingAddress,
      },
      { headers }
    );

    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to complete checkout"
    );
  }
};

/**
 * Get order by checkout ID (for orders already created by webhook)
 */
export const getOrderByCheckoutId = async (
  checkoutId: string
): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await cartApiClient.get(`/checkout/${checkoutId}/order`, {
      headers,
    });

    return data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Order not found for this checkout"
    );
  }
};

/**
 * Get active cart by user ID
 */
export const getActiveCartByUser = async (
  userId: string
): Promise<Cart | null> => {
  try {
    const headers = await getAuthHeaders();
    const { data } = await cartApiClient.get(`/users/${userId}/cart`, {
      headers,
    });

    if (data?.data?.cartId) {
      persistCartId(data.data.cartId);
    }

    return data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw new Error(error.response?.data?.error || "Failed to get user cart");
  }
};
