// ============================================================================
// SESSION MANAGEMENT FOR ANALYTICS
// ============================================================================

import Cookies from "js-cookie";

const SESSION_KEY = "modett_analytics_session";
const GUEST_TOKEN_KEY = "modett_guest_token";
const SESSION_DURATION_MINUTES = 30;

/**
 * Get existing session or create new one
 * Session expires after 30 minutes of inactivity
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  try {
    const sessionId = Cookies.get(SESSION_KEY);

    if (sessionId) {
      // Update expiry (sliding window)
      Cookies.set(SESSION_KEY, sessionId, {
        expires: SESSION_DURATION_MINUTES / (24 * 60),
      }); // Expires accepts days
      return sessionId;
    }

    // Create new session
    const newSessionId = crypto.randomUUID();
    Cookies.set(SESSION_KEY, newSessionId, {
      expires: SESSION_DURATION_MINUTES / (24 * 60),
    });

    return newSessionId;
  } catch (error) {
    console.error("Failed to manage session:", error);
    return crypto.randomUUID();
  }
}

/**
 * Get guest token for anonymous users
 */
export function getGuestToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const token = Cookies.get(GUEST_TOKEN_KEY);
    return token || null;
  } catch (error) {
    console.error("Failed to get guest token:", error);
    return null;
  }
}

/**
 * Clear session (used on logout or session expiry)
 */
export function clearSession(): void {
  if (typeof window === "undefined") return;

  try {
    Cookies.remove(SESSION_KEY);
  } catch (error) {
    console.error("Failed to clear session:", error);
  }
}

/**
 * Clear guest token (used when user creates account)
 */
export function clearGuestToken(): void {
  if (typeof window === "undefined") return;

  try {
    Cookies.remove(GUEST_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to clear guest token:", error);
  }
}

/**
 * Get current session ID without creating new one
 */
export function getCurrentSessionId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return Cookies.get(SESSION_KEY) || null;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}
