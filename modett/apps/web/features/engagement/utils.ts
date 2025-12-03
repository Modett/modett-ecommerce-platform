// ============================================================================
// ENGAGEMENT (WISHLIST) UTILITIES
// ============================================================================

const GUEST_TOKEN_KEY = "modett_guest_token";
const WISHLIST_ID_KEY = "modett_wishlist_id";

/**
 * Get the stored guest token from localStorage
 */
export const getStoredGuestToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_TOKEN_KEY);
};

/**
 * Store guest token in localStorage
 */
export const persistGuestToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_TOKEN_KEY, token);
};

/**
 * Get the stored wishlist ID from localStorage
 */
export const getStoredWishlistId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WISHLIST_ID_KEY);
};

/**
 * Store wishlist ID in localStorage
 */
export const persistWishlistId = (wishlistId: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(WISHLIST_ID_KEY, wishlistId);
};

/**
 * Clear wishlist ID from localStorage
 */
export const clearWishlistId = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WISHLIST_ID_KEY);
};

/**
 * Clear guest token from localStorage
 */
export const clearGuestToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_TOKEN_KEY);
};

/**
 * Clear all wishlist-related data from localStorage
 */
export const clearWishlistData = (): void => {
  clearWishlistId();
  clearGuestToken();
};

/**
 * Extract error messages from API response
 */
export const extractErrorMessages = (responseData: any): string[] => {
  const errors: string[] = [];

  if (typeof responseData?.error === "string") {
    errors.push(responseData.error);
  }

  if (typeof responseData?.message === "string") {
    errors.push(responseData.message);
  }

  if (Array.isArray(responseData?.errors)) {
    for (const errorItem of responseData.errors) {
      if (typeof errorItem === "string") {
        errors.push(errorItem);
      } else if (typeof errorItem?.message === "string") {
        errors.push(errorItem.message);
      }
    }
  }

  return errors;
};

/**
 * Check if error should trigger a retry (wishlist not found or unauthorized)
 */
export const shouldRetryOnError = (
  responseData: any,
  errorMessages: string[]
): boolean => {
  const message = errorMessages.join(" ").toLowerCase();
  const fallbackError =
    typeof responseData?.message === "string"
      ? responseData.message.toLowerCase()
      : "";

  return (
    /wishlist.*not found/.test(message) ||
    /unauthorized/.test(message) ||
    /wishlist.*not found/.test(fallbackError) ||
    /unauthorized/.test(fallbackError)
  );
};

/**
 * Dispatch wishlist update event to notify components
 */
export const dispatchWishlistUpdate = (
  variantId: string,
  productId: string | undefined,
  action: "add" | "remove"
): void => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("wishlistUpdated", {
      detail: { variantId, productId, action },
    })
  );
};
