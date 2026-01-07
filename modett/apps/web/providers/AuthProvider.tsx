"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { handleCartTransfer } from "@/lib/cart-transfer";

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

  const login = async (email: string, password: string) => {
    try {
      // TODO: Replace with your actual login API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const authData = await response.json();

      if (authData.data.requires2fa) {
        setTwoFactorChallenge({
          userId: authData.data.userId,
          tempToken: authData.data.tempToken,
        });
        return;
      }

      const { user, accessToken } = authData.data;

      localStorage.setItem("authToken", accessToken);

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      // 🛒 Transfer guest cart to user
      await handleCartTransfer(user.id, accessToken);
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
        }
      );

      const authData = await response.json();

      if (!authData.success) {
        throw new Error(authData.error || "2FA verification failed");
      }

      const { user, accessToken } = authData.data;

      localStorage.setItem("authToken", accessToken);

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      setTwoFactorChallenge(null);

      // 🛒 Transfer guest cart to user
      await handleCartTransfer(user.id, accessToken);
    } catch (error) {
      // Do not reset challenge on error, allow retry
      throw error;
    }
  };

  const reset2FAChallenge = () => {
    setTwoFactorChallenge(null);
  };

  const logout = async () => {
    localStorage.removeItem("authToken");
    setAuthState({ user: null, isLoading: false, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
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
