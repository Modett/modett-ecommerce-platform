// ============================================================================
// ENGAGEMENT (WISHLIST & NEWSLETTER) API
// ============================================================================

import axios from "axios";
import type {
  Wishlist,
  WishlistItem,
  NewsletterSubscription,
  SubscribeNewsletterParams,
  UnsubscribeNewsletterParams,
} from "./types";
import {
  persistWishlistId,
  clearWishlistId,
  extractErrorMessages,
  shouldRetryOnError,
  dispatchWishlistUpdate,
} from "./utils";
import { handleError } from "@/lib/error-handler";
import { getGuestToken } from "@/features/cart/api";

/**
 * Get authentication headers based on login state
 * - If authenticated: returns Bearer token
 * - If guest: returns guest token
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  if (authToken) {
    // Authenticated user - use Bearer token
    return { Authorization: `Bearer ${authToken}` };
  }

  // Guest user - use guest token
  const guestToken = await getGuestToken();
  return { "X-Guest-Token": guestToken };
};

// Create axios instance for wishlist API
const wishlistApiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL?.replace("/catalog", "") ||
    "http://localhost:3001/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Create a default wishlist for guest user
 */
export const createDefaultWishlist = async (): Promise<Wishlist> => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await wishlistApiClient.post(
      "/engagement/wishlists",
      {
        name: "My Wishlist",
        isDefault: true,
        isPublic: false,
      },
      { headers }
    );

    const wishlist = data.data;

    // Store wishlist ID in localStorage
    persistWishlistId(wishlist.wishlistId);

    return wishlist;
  } catch (error: any) {
    handleError(error, "Create wishlist");
    throw new Error(error.response?.data?.error || "Failed to create wishlist");
  }
};

/**
 * Add item to wishlist (internal with retry logic)
 */
export const addToWishlistInternal = async (
  wishlistId: string,
  variantId: string,
  hasRetried = false
): Promise<WishlistItem> => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await wishlistApiClient.post(
      `/engagement/wishlists/${wishlistId}/items`,
      {
        variantId,
        priority: 3,
      },
      { headers }
    );

    return data.data;
  } catch (error: any) {
    const responseData = error?.response?.data;
    const errorMessages = extractErrorMessages(responseData);
    const shouldRetry =
      !hasRetried && shouldRetryOnError(responseData, errorMessages);

    if (shouldRetry) {
      console.log("= Wishlist not found, retrying with fresh wishlist...");
      clearWishlistId();
      // Create new wishlist and retry
      const newWishlist = await createDefaultWishlist();
      return addToWishlistInternal(newWishlist.wishlistId, variantId, true);
    }

    handleError(error, "Add to wishlist");

    throw new Error(errorMessages[0] || "Failed to add to wishlist");
  }
};

/**
 * Add item to wishlist
 */
export const addToWishlist = async (
  wishlistId: string,
  variantId: string,
  productId?: string
): Promise<WishlistItem> => {
  const result = await addToWishlistInternal(wishlistId, variantId);

  // Dispatch custom event to notify all components
  dispatchWishlistUpdate(variantId, productId, "add");

  return result;
};

/**
 * Remove item from wishlist
 */
export const removeFromWishlist = async (
  wishlistId: string,
  variantId: string,
  productId?: string
): Promise<void> => {
  try {
    const headers = await getAuthHeaders();

    await wishlistApiClient.delete(
      `/engagement/wishlists/${wishlistId}/items/${variantId}`,
      { headers }
    );

    // Dispatch custom event to notify all components
    dispatchWishlistUpdate(variantId, productId, "remove");
  } catch (error: any) {
    handleError(error, "Remove from wishlist");
    throw new Error(
      error.response?.data?.error || "Failed to remove from wishlist"
    );
  }
};

/**
 * Get all wishlist items
 */
export const getWishlistItems = async (
  wishlistId: string
): Promise<WishlistItem[]> => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await wishlistApiClient.get(
      `/engagement/wishlists/${wishlistId}/items`,
      { headers }
    );

    return data.data || [];
  } catch (error: any) {
    handleError(error, "Get wishlist items");
    // Return empty array if wishlist doesn't exist yet
    return [];
  }
};

/**
 * Get all wishlists for a user
 */
export const getUserWishlists = async (userId: string): Promise<Wishlist[]> => {
  try {
    const headers = await getAuthHeaders();

    const { data } = await wishlistApiClient.get(
      `/engagement/users/${userId}/wishlists`,
      { headers, params: { limit: 1 } } // We currently only support 1 active wishlist per user in UI
    );

    return data.data || [];
  } catch (error: any) {
    handleError(error, "Get user wishlists");
    return [];
  }
};

/**
 * Check if a variant is in the wishlist
 */
export const isInWishlist = async (
  wishlistId: string,
  variantId: string
): Promise<boolean> => {
  try {
    const items = await getWishlistItems(wishlistId);
    return items.some((item) => item.variantId === variantId);
  } catch (error) {
    return false;
  }
};

/**
 * Check if any variant of a product is in the wishlist (product-level check)
 */
export const isProductInWishlist = async (
  wishlistId: string,
  variantIds: string[]
): Promise<boolean> => {
  try {
    const items = await getWishlistItems(wishlistId);
    return items.some((item) => variantIds.includes(item.variantId));
  } catch (error) {
    return false;
  }
};

/**
 * Get the wishlisted variant ID for a product (if any)
 */
export const getWishlistedVariantId = async (
  wishlistId: string,
  variantIds: string[]
): Promise<string | null> => {
  try {
    const items = await getWishlistItems(wishlistId);
    const wishlistedItem = items.find((item) =>
      variantIds.includes(item.variantId)
    );
    return wishlistedItem?.variantId || null;
  } catch (error) {
    return null;
  }
};

// ============================================================================
// NEWSLETTER API
// ============================================================================

/**
 * Subscribe to newsletter
 */
export const subscribeNewsletter = async (
  params: SubscribeNewsletterParams
): Promise<NewsletterSubscription> => {
  try {
    const { data } = await wishlistApiClient.post(
      "/engagement/newsletter/subscribe",
      {
        email: params.email,
        source: params.source,
      }
    );

    return data.data;
  } catch (error: any) {
    handleError(error, "Subscribe to newsletter");
    throw new Error(
      error.response?.data?.error || "Failed to subscribe to newsletter"
    );
  }
};

/**
 * Unsubscribe from newsletter
 */
export const unsubscribeNewsletter = async (
  params: UnsubscribeNewsletterParams
): Promise<void> => {
  try {
    await wishlistApiClient.post("/engagement/newsletter/unsubscribe", {
      subscriptionId: params.subscriptionId,
      email: params.email,
    });
  } catch (error: any) {
    handleError(error, "Unsubscribe from newsletter");
    throw new Error(
      error.response?.data?.error || "Failed to unsubscribe from newsletter"
    );
  }
};

/**
 * Get newsletter subscription by ID or email
 */
export const getNewsletterSubscription = async (
  subscriptionId?: string,
  email?: string
): Promise<NewsletterSubscription | null> => {
  try {
    const params: any = {};
    if (subscriptionId) params.subscriptionId = subscriptionId;
    if (email) params.email = email;

    const { data } = await wishlistApiClient.get(
      "/engagement/newsletter/subscription",
      { params }
    );

    return data.data || null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    handleError(error, "Get newsletter subscription");
    throw new Error(
      error.response?.data?.error || "Failed to get newsletter subscription"
    );
  }
};
