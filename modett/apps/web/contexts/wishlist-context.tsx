"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { wishlistService } from "@/services";
import type { Wishlist } from "@/types";
import { APIError } from "@/lib/fetcher";

interface WishlistContextType {
  wishlist: Wishlist | null;
  isLoading: boolean;
  addItem: (variantId: string) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  toggleItem: (variantId: string) => Promise<{ added: boolean }>;
  isInWishlist: (variantId: string) => boolean;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [guestToken, setGuestToken] = useState<string | null>(null);

  const WISHLIST_ID_KEY = "guestWishlistId";
  const WISHLIST_TOKEN_KEY = "guestWishlistToken";

  const generateGuestToken = () => {
    if (typeof window === "undefined" || !window.crypto?.getRandomValues) {
      return crypto.randomUUID().replace(/-/g, "");
    }
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  };

  const ensureGuestAuth = () => {
    if (typeof window === "undefined") {
      return {};
    }
    let token = guestToken || localStorage.getItem(WISHLIST_TOKEN_KEY);
    if (!token) {
      token = generateGuestToken();
      localStorage.setItem(WISHLIST_TOKEN_KEY, token);
    }
    if (token !== guestToken) {
      setGuestToken(token);
    }
    return token ? { guestToken: token } : {};
  };

  // Initialize wishlist on mount
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async (): Promise<Wishlist | null> => {
    try {
      setIsLoading(true);
      const auth = ensureGuestAuth();
      if (!auth.guestToken) {
        return null;
      }

      const storedId =
        typeof window !== "undefined"
          ? localStorage.getItem(WISHLIST_ID_KEY)
          : null;

      if (storedId) {
        try {
          const existingWishlist = await wishlistService.getWishlistById(
            storedId,
            auth
          );
          setWishlist(existingWishlist);
          return existingWishlist;
        } catch (error) {
          localStorage.removeItem(WISHLIST_ID_KEY);
        }
      }

      const createdWishlist = await wishlistService.createWishlist(
        {
          name: "My Wishlist",
          isDefault: true,
          isPublic: false,
          description: "Saved items",
          guestToken: auth.guestToken,
        },
        auth
      );

      if (typeof window !== "undefined") {
        localStorage.setItem(WISHLIST_ID_KEY, createdWishlist.id);
      }
      setWishlist(createdWishlist);
      return createdWishlist;
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (variantId: string) => {
    try {
      if (isInWishlist(variantId)) {
        return;
      }

      setIsLoading(true);
      const auth = ensureGuestAuth();

      let activeWishlist = wishlist;
      if (!activeWishlist) {
        activeWishlist = await loadWishlist();
        if (!activeWishlist) {
          throw new Error("Unable to initialize wishlist");
        }
      }

      const tryAdd = async (listId: string) => {
        await wishlistService.addItem(
          listId,
          variantId,
          auth
        );

        const refreshed = await wishlistService.getWishlistById(listId, auth);
        setWishlist(refreshed);
      };

      try {
        await tryAdd(activeWishlist.id);
      } catch (error) {
        if (
          error instanceof APIError &&
          error.status === 400 &&
          typeof window !== "undefined"
        ) {
          localStorage.removeItem(WISHLIST_ID_KEY);
          setWishlist(null);
          const recreated = await loadWishlist();
          if (recreated) {
            await tryAdd(recreated.id);
            return;
          }
        }

        console.error("Failed to add item to wishlist:", error);
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (variantId: string) => {
    try {
      if (!wishlist || !isInWishlist(variantId)) return;

      setIsLoading(true);
      const auth = ensureGuestAuth();
      const listId = wishlist.id;

      try {
        await wishlistService.removeItem(listId, variantId, auth);
        const refreshed = await wishlistService.getWishlistById(listId, auth);
        setWishlist(refreshed);
      } catch (error) {
        if (
          error instanceof APIError &&
          (error.status === 400 || error.status === 404) &&
          typeof window !== "undefined"
        ) {
          localStorage.removeItem(WISHLIST_ID_KEY);
          setWishlist(null);
          await loadWishlist();
          return;
        }

        console.error("Failed to remove item from wishlist:", error);
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = async (variantId: string): Promise<{ added: boolean }> => {
    if (isInWishlist(variantId)) {
      await removeItem(variantId);
      return { added: false };
    }

    await addItem(variantId);
    return { added: true };
  };

  const isInWishlist = (variantId: string): boolean => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some((item) => item.variantId === variantId);
  };

  const itemCount = wishlist?.items?.length || 0;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
        itemCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
