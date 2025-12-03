// ============================================================================
// CART UTILITIES
// ============================================================================

const GUEST_TOKEN_KEY = "modett_guest_token";
const CART_ID_KEY = "modett_cart_id";

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
 * Get the stored cart ID from localStorage
 */
export const getStoredCartId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CART_ID_KEY);
};

/**
 * Store cart ID in localStorage
 */
export const persistCartId = (cartId: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_ID_KEY, cartId);
};

/**
 * Clear guest token from localStorage
 */
export const clearGuestToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_TOKEN_KEY);
};

/**
 * Clear cart ID from localStorage
 */
export const clearCartId = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_ID_KEY);
};

/**
 * Clear all cart-related data from localStorage
 */
export const clearCartData = (): void => {
  clearGuestToken();
  clearCartId();
};
