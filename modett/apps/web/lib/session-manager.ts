// ============================================================================
// SESSION MANAGEMENT FOR ANALYTICS
// ============================================================================

const SESSION_KEY = 'modett_analytics_session';
const GUEST_TOKEN_KEY = 'modett_guest_token';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

interface SessionData {
  sessionId: string;
  timestamp: number;
}

/**
 * Get existing session or create new one
 * Session expires after 30 minutes of inactivity
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  try {
    const stored = localStorage.getItem(SESSION_KEY);

    if (stored) {
      const data: SessionData = JSON.parse(stored);

      // Check if session expired (30 min of inactivity)
      if (Date.now() - data.timestamp < SESSION_DURATION) {
        // Update timestamp to extend session
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            sessionId: data.sessionId,
            timestamp: Date.now(),
          })
        );
        return data.sessionId;
      }
    }

    // Create new session
    const sessionId = crypto.randomUUID();
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        sessionId,
        timestamp: Date.now(),
      })
    );

    return sessionId;
  } catch (error) {
    console.error('Failed to manage session:', error);
    return crypto.randomUUID();
  }
}

/**
 * Get guest token for anonymous users
 *
 * IMPORTANT: This returns the existing guest token from cart system.
 * It does NOT create a new token - the cart API creates tokens when needed.
 * This ensures token format consistency (64-char hex required by backend).
 *
 * Analytics tracking will use the cart's token if available, or null if not.
 * The backend analytics service accepts null guest tokens for product views.
 */
export function getGuestToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const token = localStorage.getItem(GUEST_TOKEN_KEY);
    // Return existing token (created by cart system) or null
    return token;
  } catch (error) {
    console.error('Failed to get guest token:', error);
    return null;
  }
}

/**
 * Clear session (used on logout or session expiry)
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

/**
 * Clear guest token (used when user creates account)
 */
export function clearGuestToken(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(GUEST_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to clear guest token:', error);
  }
}

/**
 * Get current session ID without creating new one
 */
export function getCurrentSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      const data: SessionData = JSON.parse(stored);

      // Check if session expired
      if (Date.now() - data.timestamp < SESSION_DURATION) {
        return data.sessionId;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}
