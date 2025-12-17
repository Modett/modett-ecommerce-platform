// ============================================================================
// CART API
// ============================================================================

import axios from "axios";
import type { AddToCartParams, Cart } from "./types";
import {
  getStoredGuestToken,
  persistGuestToken,
  persistCartId
} from "./utils";

// Create axios instance for cart API
const cartApiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL?.replace("/catalog", "/cart") ||
    "http://localhost:3001/api/v1/cart",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
    console.error("Failed to generate guest token:", error);
    throw error;
  }
};

/**
 * Get or generate guest token
 */
export const getGuestToken = async (): Promise<string> => {
  const storedToken = getStoredGuestToken();
  if (storedToken) {
    return storedToken;
  }
  return await generateGuestToken();
};

/**
 * Add item to cart
 */
export const addToCart = async (params: AddToCartParams): Promise<Cart> => {
  try {
    const token = await getGuestToken();

    const { data } = await cartApiClient.post(
      "/cart/items",
      {
        variantId: params.variantId,
        quantity: params.quantity,
        isGift: params.isGift || false,
        giftMessage: params.giftMessage,
      },
      {
        headers: {
          "X-Guest-Token": token,
        },
      }
    );

    if (data?.data?.cartId) {
      persistCartId(data.data.cartId);
    }

    return data.data;
  } catch (error: any) {
    console.error("Failed to add item to cart:", error);
    throw new Error(
      error.response?.data?.error || "Failed to add item to cart"
    );
  }
};

/**
 * Get cart by ID
 */
export const getCart = async (cartId: string): Promise<Cart> => {
  try {
    const token = await getGuestToken();

    const { data } = await cartApiClient.get(`/carts/${cartId}`, {
      headers: {
        "X-Guest-Token": token,
      },
    });

    if (data?.data?.cartId) {
      persistCartId(data.data.cartId);
    }

    return data.data;
  } catch (error: any) {
    console.error("Failed to get cart:", error);
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
    const token = await getGuestToken();

    const { data } = await cartApiClient.put(
      `/carts/${cartId}/items/${variantId}`,
      { quantity },
      {
        headers: {
          "X-Guest-Token": token,
        },
      }
    );

    return data.data;
  } catch (error: any) {
    console.error("Failed to update cart item:", error);
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
    const token = await getGuestToken();

    const { data } = await cartApiClient.delete(
      `/carts/${cartId}/items/${variantId}`,
      {
        headers: {
          "X-Guest-Token": token,
        },
      }
    );

    return data.data;
  } catch (error: any) {
    console.error("Failed to remove cart item:", error);
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
      `/guest/${guestToken}/transfer`,
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

    return data.data;
  } catch (error: any) {
    console.error("Failed to transfer cart:", error);
    throw new Error(
      error.response?.data?.error || "Failed to transfer cart"
    );
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
    const token = await getGuestToken();

    const { data } = await cartApiClient.patch(
      `/carts/${cartId}/email`,
      { email },
      {
        headers: {
          "X-Guest-Token": token,
        },
      }
    );

    return data.data;
  } catch (error: any) {
    console.error("Failed to update cart email:", error);
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
    const token = await getGuestToken();

    const { data } = await cartApiClient.patch(
      `/carts/${cartId}/shipping`,
      shippingData,
      {
        headers: {
          "X-Guest-Token": token,
        },
      }
    );

    return data.data;
  } catch (error: any) {
    console.error("Failed to update cart shipping:", error);
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
    const token = await getGuestToken();

    const { data } = await cartApiClient.patch(
      `/carts/${cartId}/addresses`,
      addressData,
      {
        headers: {
          "X-Guest-Token": token,
        },
      }
    );

    return data.data;
  } catch (error: any) {
    console.error("Failed to update cart addresses:", error);
    throw new Error(
      error.response?.data?.error || "Failed to update cart addresses"
    );
  }
};
