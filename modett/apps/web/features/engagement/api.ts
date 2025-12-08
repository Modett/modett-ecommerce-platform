// ============================================================================
// ENGAGEMENT (WISHLIST) API
// ============================================================================

import axios from "axios";
import type { Wishlist, WishlistItem } from "./types";
import {
  getStoredGuestToken,
  persistGuestToken,
  persistWishlistId,
  clearWishlistId,
  extractErrorMessages,
  shouldRetryOnError,
  dispatchWishlistUpdate,
} from "./utils";

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
 * Generate a guest token
 */
export const generateGuestToken = async (): Promise<string> => {
  try {
    const { data } = await wishlistApiClient.get("/cart/generate-guest-token");
    const token = data.data.guestToken;

    // Store in localStorage
    persistGuestToken(token);
    // Drop any cached wishlist that belonged to an older token
    clearWishlistId();

    return token;
  } catch (error: any) {
    console.error("Failed to generate guest token:", error);
    throw new Error(
      error.response?.data?.error || "Failed to generate guest token"
    );
  }
};

/**
 * Get the guest token from localStorage or generate one
 */
export const getGuestToken = async (): Promise<string> => {
  const existingToken = getStoredGuestToken();
  if (existingToken) {
    return existingToken;
  }

  return await generateGuestToken();
};

/**
 * Create a default wishlist for guest user
 */
export const createDefaultWishlist = async (): Promise<Wishlist> => {
  try {
    const guestToken = await getGuestToken();

    const { data } = await wishlistApiClient.post("/engagement/wishlists", {
      guestToken,
      name: "My Wishlist",
      isDefault: true,
      isPublic: false,
    });

    const wishlist = data.data;

    // Store wishlist ID in localStorage
    persistWishlistId(wishlist.wishlistId);

    return wishlist;
  } catch (error: any) {
    console.error("Failed to create wishlist:", error);
    throw new Error(
      error.response?.data?.error || "Failed to create wishlist"
    );
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
    const guestToken = await getGuestToken();

    const { data } = await wishlistApiClient.post(
      `/engagement/wishlists/${wishlistId}/items`,
      {
        variantId,
        priority: 3,
      },
      {
        headers: {
          "X-Guest-Token": guestToken,
        },
      }
    );

    return data.data;
  } catch (error: any) {
    const responseData = error?.response?.data;
    const errorMessages = extractErrorMessages(responseData);
    const shouldRetry = !hasRetried && shouldRetryOnError(responseData, errorMessages);

    if (shouldRetry) {
      console.log("= Wishlist not found, retrying with fresh wishlist...");
      clearWishlistId();
      // Create new wishlist and retry
      const newWishlist = await createDefaultWishlist();
      return addToWishlistInternal(newWishlist.wishlistId, variantId, true);
    }

    console.error("L Failed to add to wishlist:", errorMessages[0] || error.message);

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
    const guestToken = await getGuestToken();

    await wishlistApiClient.delete(
      `/engagement/wishlists/${wishlistId}/items/${variantId}`,
      {
        headers: { "X-Guest-Token": guestToken },
      }
    );

    // Dispatch custom event to notify all components
    dispatchWishlistUpdate(variantId, productId, "remove");
  } catch (error: any) {
    console.error("Failed to remove from wishlist:", error);
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
    const { data } = await wishlistApiClient.get(
      `/engagement/wishlists/${wishlistId}/items`
    );

    return data.data || [];
  } catch (error: any) {
    console.error("Failed to get wishlist items:", error);
    // Return empty array if wishlist doesn't exist yet
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
    const wishlistedItem = items.find((item) => variantIds.includes(item.variantId));
    return wishlistedItem?.variantId || null;
  } catch (error) {
    return null;
  }
};
