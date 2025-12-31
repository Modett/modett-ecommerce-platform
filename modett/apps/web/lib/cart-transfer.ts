import { transferGuestCartToUser } from "@/features/cart/api";
import { getStoredGuestToken } from "@/features/cart/utils";
import { handleError } from "@/lib/error-handler";

export async function handleCartTransfer(
  userId: string,
  userAuthToken: string,
  options?: {
    mergeWithExisting?: boolean;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    silent?: boolean; // If true, don't throw errors
  }
): Promise<boolean> {
  const {
    mergeWithExisting = true,
    onSuccess,
    onError,
    silent = true,
  } = options || {};

  try {
    // Get the guest token from localStorage
    const guestToken = getStoredGuestToken();

    // If no guest token, user didn't have a guest cart - nothing to transfer
    if (!guestToken) {
      console.log("[Cart Transfer] No guest token found - skipping transfer");
      return false;
    }

    console.log("[Cart Transfer] Transferring guest cart to user...");

    // Transfer the cart
    await transferGuestCartToUser(
      guestToken,
      userId,
      userAuthToken,
      mergeWithExisting
    );

    console.log("[Cart Transfer] ✓ Cart transferred successfully!");

    // Remove guest token after successful transfer
    localStorage.removeItem("guestToken");

    // Call success callback if provided
    if (onSuccess) {
      onSuccess();
    }

    return true;
  } catch (error) {
    handleError(error, "Cart Transfer");

    // Call error callback if provided
    if (onError && error instanceof Error) {
      onError(error);
    }

    // Re-throw error if not silent mode
    if (!silent) {
      throw error;
    }

    return false;
  }
}

/**
 * Example usage in different auth scenarios
 */

// ============================================================================
// EXAMPLE 1: Custom Login Form
// ============================================================================
/*
import { handleCartTransfer } from "@/lib/cart-transfer";

const handleLogin = async (email: string, password: string) => {
  try {
    // 1. Login user
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const authData = await response.json();

    // 2. Transfer cart
    await handleCartTransfer(authData.userId, authData.token);

    // 3. Redirect
    router.push("/");
  } catch (error) {
    console.error("Login failed:", error);
  }
};
*/

// ============================================================================
// EXAMPLE 2: NextAuth (useSession hook)
// ============================================================================
/*
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { handleCartTransfer } from "@/lib/cart-transfer";

export function useAutoCartTransfer() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      handleCartTransfer(
        session.user.id,
        session.accessToken,
        {
          onSuccess: () => {
            console.log("Cart transferred!");
          },
        }
      );
    }
  }, [status, session]);
}
*/

// ============================================================================
// EXAMPLE 3: Auth Context Provider
// ============================================================================
/*
import { createContext, useContext, useEffect, useState } from "react";
import { handleCartTransfer } from "@/lib/cart-transfer";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Login API call
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const authData = await response.json();

    setUser(authData.user);

    // Transfer cart after login
    await handleCartTransfer(authData.userId, authData.token);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
*/

// ============================================================================
// EXAMPLE 4: OAuth/Social Login (Google, Facebook, etc.)
// ============================================================================
/*
import { handleCartTransfer } from "@/lib/cart-transfer";

const handleGoogleLogin = async () => {
  try {
    // Trigger OAuth flow
    const authWindow = window.open("/api/auth/google", "_blank");

    // Listen for auth completion
    window.addEventListener("message", async (event) => {
      if (event.data.type === "AUTH_SUCCESS") {
        const { userId, token } = event.data;

        // Transfer cart
        await handleCartTransfer(userId, token);

        // Redirect
        window.location.href = "/";
      }
    });
  } catch (error) {
    console.error("OAuth login failed:", error);
  }
};
*/

// ============================================================================
// EXAMPLE 5: Server-Side Login (Server Actions in Next.js 14+)
// ============================================================================
/*
"use server";

import { handleCartTransfer } from "@/lib/cart-transfer";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Authenticate user
  const authData = await authenticateUser(email, password);

  // Transfer cart (if client-side data available)
  // Note: Server actions may need client-side follow-up for cart transfer
  // since localStorage is client-side only

  return { success: true, userId: authData.userId, token: authData.token };
}

// Client component
"use client";

import { useEffect } from "react";
import { handleCartTransfer } from "@/lib/cart-transfer";

export function LoginForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await loginAction(formData);

    if (result.success) {
      // Transfer cart on client side
      await handleCartTransfer(result.userId, result.token);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
*/
