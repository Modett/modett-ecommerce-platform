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
  logout: () => Promise<void>;
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

  const login = async (email: string, password: string) => {
    try {
      // TODO: Replace with your actual login API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const authData = await response.json();
      const { user, token } = authData.data;

      localStorage.setItem("authToken", token);

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      // 🛒 Transfer guest cart to user
      await handleCartTransfer(user.id, token);

    } catch (error) {
      setAuthState({ user: null, isLoading: false, isAuthenticated: false });
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem("authToken");
    setAuthState({ user: null, isLoading: false, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
