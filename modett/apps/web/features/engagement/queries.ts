// ============================================================================
// ENGAGEMENT (WISHLIST) REACT QUERY HOOKS
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import * as wishlistApi from "./api";
import type { AddToWishlistParams, RemoveFromWishlistParams } from "./types";
import { getStoredWishlistId, persistWishlistId } from "./utils";
import { handleError } from "@/lib/error-handler";

/**
 * Query key factory for wishlist queries
 */
export const wishlistKeys = {
  all: ["wishlist"] as const,
  wishlist: (id: string) => ["wishlist", id] as const,
  items: (id: string) => ["wishlist", id, "items"] as const,
};

// Global flag to prevent multiple simultaneous wishlist creations
let isCreatingWishlist = false;
let wishlistCreationPromise: Promise<any> | null = null;

/**
 * Hook to get or create wishlist ID
 */
export const useWishlistId = () => {
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initWishlistId = async () => {
      // Try to get from localStorage first
      const storedId = getStoredWishlistId();

      if (storedId) {
        setWishlistId(storedId);
        setIsInitializing(false);
        return;
      }

      // If already creating, wait for that creation to finish
      if (isCreatingWishlist && wishlistCreationPromise) {
        try {
          const wishlist = await wishlistCreationPromise;
          setWishlistId(wishlist.wishlistId);
        } catch (error) {
          handleError(error, "Initialize wishlist");
        } finally {
          setIsInitializing(false);
        }
        return;
      }

      // Create a new wishlist if none exists
      isCreatingWishlist = true;
      wishlistCreationPromise = wishlistApi.createDefaultWishlist();

      try {
        const wishlist = await wishlistCreationPromise;
        setWishlistId(wishlist.wishlistId);
        persistWishlistId(wishlist.wishlistId);
      } catch (error) {
        handleError(error, "Initialize wishlist");
      } finally {
        setIsInitializing(false);
        isCreatingWishlist = false;
        wishlistCreationPromise = null;
      }
    };

    initWishlistId();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedId = getStoredWishlistId();
      setWishlistId(storedId);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return { wishlistId, isInitializing };
};

export const useWishlistIdQuery = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["wishlistId"],
    queryFn: getStoredWishlistId,
    staleTime: 0,
  });
};

/**
 * Hook to fetch wishlist items
 */
export const useWishlistItems = (wishlistId: string | null) => {
  return useQuery({
    queryKey: wishlistKeys.items(wishlistId || ""),
    queryFn: () => wishlistApi.getWishlistItems(wishlistId!),
    enabled: !!wishlistId,
  });
};

/**
 * Hook to add item to wishlist
 */
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      wishlistId,
      variantId,
      productId,
    }: AddToWishlistParams & { wishlistId: string }) => {
      return wishlistApi.addToWishlist(wishlistId, variantId, productId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: wishlistKeys.all,
      });
    },
  });
};

/**
 * Hook to remove item from wishlist
 */
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      wishlistId,
      variantId,
      productId,
    }: RemoveFromWishlistParams & { wishlistId: string }) => {
      return wishlistApi.removeFromWishlist(wishlistId, variantId, productId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: wishlistKeys.all,
      });
    },
  });
};

/**
 * Hook to check if variant is in wishlist
 */
export const useIsInWishlist = (
  wishlistId: string | null,
  variantId: string
) => {
  return useQuery({
    queryKey: ["wishlist", wishlistId, "contains", variantId],
    queryFn: () => wishlistApi.isInWishlist(wishlistId!, variantId),
    enabled: !!wishlistId && !!variantId,
  });
};

/**
 * Hook to check if product is in wishlist (any variant)
 */
export const useIsProductInWishlist = (
  wishlistId: string | null,
  variantIds: string[]
) => {
  return useQuery({
    queryKey: ["wishlist", wishlistId, "product-contains", variantIds],
    queryFn: () => wishlistApi.isProductInWishlist(wishlistId!, variantIds),
    enabled: !!wishlistId && variantIds.length > 0,
  });
};

/**
 * Hook to get the wishlisted variant ID for a product (if any)
 */
export const useWishlistedVariantId = (
  wishlistId: string | null,
  variantIds: string[]
) => {
  return useQuery({
    queryKey: ["wishlist", wishlistId, "wishlisted-variant", variantIds],
    queryFn: () => wishlistApi.getWishlistedVariantId(wishlistId!, variantIds),
    enabled: !!wishlistId && variantIds.length > 0,
  });
};
