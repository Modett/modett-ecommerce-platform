// ============================================================================
// CART UTILITIES
// ============================================================================

import Cookies from "js-cookie";

const GUEST_TOKEN_KEY = "modett_guest_token";
const CART_ID_KEY = "modett_cart_id";
const COOKIE_EXPIRY_DAYS = 30;

/**
 * Get the stored guest token from Cookies
 */
export const getStoredGuestToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return Cookies.get(GUEST_TOKEN_KEY) || null;
};

/**
 * Store guest token in Cookies
 */
export const persistGuestToken = (token: string): void => {
  if (typeof window === "undefined") return;
  Cookies.set(GUEST_TOKEN_KEY, token, { expires: COOKIE_EXPIRY_DAYS });
};

/**
 * Get the stored cart ID from Cookies
 */
export const getStoredCartId = (): string | null => {
  if (typeof window === "undefined") return null;
  return Cookies.get(CART_ID_KEY) || null;
};

/**
 * Store cart ID in Cookies and dispatch event
 */
export const persistCartId = (cartId: string): void => {
  if (typeof window === "undefined") return;
  Cookies.set(CART_ID_KEY, cartId, { expires: COOKIE_EXPIRY_DAYS });
  window.dispatchEvent(new CustomEvent("cart-id-changed", { detail: cartId }));
};

/**
 * Clear guest token from Cookies
 */
export const clearGuestToken = (): void => {
  if (typeof window === "undefined") return;
  Cookies.remove(GUEST_TOKEN_KEY);
};

/**
 * Clear cart ID from Cookies and dispatch event
 */
export const clearCartId = (): void => {
  if (typeof window === "undefined") return;
  Cookies.remove(CART_ID_KEY);
  window.dispatchEvent(new CustomEvent("cart-id-changed", { detail: null }));
};

/**
 * Clear cart after successful checkout
 * Keeps guest token to maintain user identity across sessions
 */
export const clearCartAfterCheckout = (): void => {
  clearCartId();
  // Clear checkout session data
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("checkout_email");
  }
};

/**
 * Clear all cart-related data from Cookies
 * Use this on logout or account creation
 */
export const clearCartData = (): void => {
  clearGuestToken();
  clearCartId();
  // Clear checkout session data
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("checkout_email");
  }
};
