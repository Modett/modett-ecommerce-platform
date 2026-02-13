"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { handleCartTransfer } from "@/lib/cart-transfer";
import { getActiveCartByUser } from "@/features/cart/api";
import { getStoredCartId } from "@/features/cart/utils";
import {
  clearWishlistData,
  persistWishlistId,
  getStoredWishlistId,
} from "@/features/engagement/utils";
import {
  getUserWishlists,
  getWishlistItems,
  addToWishlistInternal,
} from "@/features/engagement/api";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWith2FA: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  twoFactorChallenge: { userId: string; tempToken: string } | null;
  reset2FAChallenge: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<{
    userId: string;
    tempToken: string;
  } | null>(null);

  /**
   * Merge guest wishlist items with authenticated user wishlist
   * This preserves guest browsing session items when user logs in
   */
  const handleWishlistMerge = async (userId: string) => {
    try {
      // Get guest wishlist ID from localStorage
      const guestWishlistId = getStoredWishlistId();

      if (!guestWishlistId) {
        // Just restore user's wishlist
        const wishlists = await getUserWishlists(userId);
        if (wishlists.length > 0) {
          persistWishlistId(wishlists[0].wishlistId);
        }
        return;
      }

      const guestItems = await getWishlistItems(guestWishlistId);

      const userWishlists = await getUserWishlists(userId);
      let userWishlistId: string;

      if (userWishlists.length > 0) {
        userWishlistId = userWishlists[0].wishlistId;
      } else {
        userWishlistId = guestWishlistId;
      }

      // Get existing user wishlist items to avoid duplicates
      const userItems =
        userWishlists.length > 0 ? await getWishlistItems(userWishlistId) : [];

      const existingVariantIds = new Set(
        userItems.map((item) => item.variantId),
      );

      // Merge: Add guest items to user wishlist (skip duplicates)
      for (const item of guestItems) {
        if (existingVariantIds.has(item.variantId)) {
          continue;
        }

        try {
          if (userWishlists.length > 0) {
            await addToWishlistInternal(userWishlistId, item.variantId);
          }
        } catch (error) {
          // Silently continue on error
        }
      }

      // Update stored wishlist ID to user's wishlist
      if (userWishlists.length > 0) {
        persistWishlistId(userWishlistId);
      }
    } catch (error) {}
  };

  const login = async (email: string, password: string) => {
    try {
      // TODO: Replace with your actual login API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const authData = await response.json();

      if (!response.ok || !authData.success) {
        throw new Error(authData.error || "Login failed");
      }

      if (!authData.data) {
        throw new Error("Invalid response from server");
      }

      if (authData.data.requires2fa) {
        setTwoFactorChallenge({
          userId: authData.data.userId,
          tempToken: authData.data.tempToken,
        });
        return;
      }

      const { user: apiUser, accessToken } = authData.data;

      // Map API response to User interface (ensure we have 'id' field)
      const user = {
        id: apiUser.userId || apiUser.id,
        email: apiUser.email,
        name:
          apiUser.name ||
          `${apiUser.firstName || ""} ${apiUser.lastName || ""}`.trim() ||
          undefined,
      };

      localStorage.setItem("authToken", accessToken);

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      // 🛒 Transfer guest cart to user
      await handleCartTransfer(user.id, accessToken);

      // If no cart ID is stored (transfer failed or skipped), try to restore active user cart
      const storedCartId = getStoredCartId();

      if (!storedCartId) {
        try {
          await getActiveCartByUser(user.id);
        } catch (err) {
          // Failed to restore active cart - ignore
        }
      }

      await handleWishlistMerge(user.id);

      // Invalidate queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    } catch (error) {
      setAuthState({ user: null, isLoading: false, isAuthenticated: false });
      throw error;
    }
  };

  const loginWith2FA = async (code: string) => {
    if (!twoFactorChallenge) throw new Error("No 2FA challenge pending");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login/2fa`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tempToken: twoFactorChallenge.tempToken,
            token: code,
          }),
        },
      );

      const authData = await response.json();

      if (!authData.success) {
        throw new Error(authData.error || "2FA verification failed");
      }

      const { user: apiUser, accessToken } = authData.data;

      // Map API response to User interface (ensure we have 'id' field)
      const user = {
        id: apiUser.userId || apiUser.id,
        email: apiUser.email,
        name:
          apiUser.name ||
          `${apiUser.firstName || ""} ${apiUser.lastName || ""}`.trim() ||
          undefined,
      };

      localStorage.setItem("authToken", accessToken);

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      setTwoFactorChallenge(null);

      // 🛒 Transfer guest cart to user
      await handleCartTransfer(user.id, accessToken);

      // If no cart ID is stored (transfer failed or skipped), try to restore active user cart
      if (!getStoredCartId()) {
        try {
          await getActiveCartByUser(user.id);
        } catch (err) {
          // No active cart found or error - ignore
        }
      }

      await handleWishlistMerge(user.id);

      await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    } catch (error) {
      // Do not reset challenge on error, allow retry
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      // Split name into firstName and lastName
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, firstName, lastName }),
        },
      );

      const authData = await response.json();

      if (!response.ok || !authData.success) {
        throw new Error(authData.error || "Registration failed");
      }

      if (!authData.data) {
        throw new Error("Invalid response from server");
      }

      // Handle both response formats for backward compatibility
      const { user: apiUser, accessToken, refreshToken } = authData.data;

      // Map API response to User interface (ensure we have 'id' field)
      const user = {
        id: apiUser.userId || apiUser.id,
        email: apiUser.email,
        name:
          apiUser.name ||
          `${apiUser.firstName || ""} ${apiUser.lastName || ""}`.trim() ||
          undefined,
      };

      localStorage.setItem("authToken", accessToken);

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      // 🛒 Transfer guest cart to user
      await handleCartTransfer(user.id, accessToken);

      // If no cart ID is stored (transfer failed or skipped), try to restore active user cart
      if (!getStoredCartId()) {
        try {
          await getActiveCartByUser(user.id);
        } catch (err) {
          // No active cart found or error - ignore
        }
      }

      await handleWishlistMerge(user.id);

      // Invalidate queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    } catch (error) {
      setAuthState({ user: null, isLoading: false, isAuthenticated: false });
      throw error;
    }
  };

  const reset2FAChallenge = () => {
    setTwoFactorChallenge(null);
  };

  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = async () => {
    localStorage.removeItem("authToken");
    clearWishlistData();
    setAuthState({ user: null, isLoading: false, isAuthenticated: false });

    // Clear React Query cache to remove stale data (including wishlist)
    queryClient.clear();

    router.push("/login");
  };

  // Restore authentication state from localStorage on mount
  useEffect(() => {
    const restoreAuth = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      try {
        // Verify token with backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("authToken");
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
          return;
        }

        // If server error or network issue, keep user logged in but mark as loading complete
        if (!response.ok) {
          setAuthState({
            user: authState.user, // Keep existing user state
            isLoading: false,
            isAuthenticated: !!token, // Still authenticated if token exists
          });
          return;
        }

        const data = await response.json();

        if (data.success && data.data) {
          // Map API response to User interface (API uses 'userId', we use 'id')
          const userData = {
            id: data.data.userId || data.data.id,
            email: data.data.email,
            name:
              data.data.name ||
              `${data.data.firstName || ""} ${data.data.lastName || ""}`.trim() ||
              undefined,
          };

          setAuthState({
            user: userData,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          // Invalid response format, but don't log out - might be temporary issue
          setAuthState({
            user: authState.user,
            isLoading: false,
            isAuthenticated: !!token,
          });
        }
      } catch (error) {
        // Network error or server unavailable - keep user logged in
        setAuthState({
          user: authState.user,
          isLoading: false,
          isAuthenticated: !!token,
        });
      }
    };

    restoreAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        loginWith2FA,
        logout,
        twoFactorChallenge,
        reset2FAChallenge,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
