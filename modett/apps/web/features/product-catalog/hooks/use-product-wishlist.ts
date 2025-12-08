import { useState, useEffect } from "react";
import { useWishlistId, useAddToWishlist, useRemoveFromWishlist, useIsProductInWishlist, useWishlistedVariantId } from "@/features/engagement/queries";
import { toast } from "sonner";

interface UseProductWishlistParams {
  productId: string;
  variantIds: string[];
  productTitle: string;
}

export function useProductWishlist({ productId, variantIds, productTitle }: UseProductWishlistParams) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const { wishlistId } = useWishlistId();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const { data: isProductWishlisted } = useIsProductInWishlist(wishlistId, variantIds);
  const { data: wishlistedVariantId } = useWishlistedVariantId(wishlistId, variantIds);

  useEffect(() => {
    if (isProductWishlisted !== undefined) {
      setIsWishlisted(isProductWishlisted);
    }
  }, [isProductWishlisted]);

  useEffect(() => {
    const handleWishlistUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { productId: eventProductId, action } = customEvent.detail;

      if (eventProductId && eventProductId === productId) {
        setIsWishlisted(action === 'add');
      }
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, [productId]);

  const toggleWishlist = async (defaultVariantId: string) => {
    if (!wishlistId) {
      toast.error("Wishlist not available");
      return;
    }

    setIsTogglingWishlist(true);
    try {
      if (isWishlisted) {
        const variantToRemove = wishlistedVariantId || defaultVariantId;
        await removeFromWishlistMutation.mutateAsync({
          wishlistId,
          variantId: variantToRemove,
          productId,
        });
        setIsWishlisted(false);
        toast.success(`${productTitle} removed from wishlist`);
      } else {
        await addToWishlistMutation.mutateAsync({
          wishlistId,
          variantId: defaultVariantId,
          productId,
        });
        setIsWishlisted(true);
        toast.success(`${productTitle} added to wishlist!`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return {
    isWishlisted,
    isTogglingWishlist,
    toggleWishlist,
  };
}
