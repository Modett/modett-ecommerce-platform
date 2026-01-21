"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, ShoppingBag } from "lucide-react";
import { useWishlistId, useWishlistItems } from "@/features/engagement/queries";
import { WishlistProductCard } from "@/features/engagement/components/wishlist-product-card";
import { getProductBySlug } from "@/features/product-catalog/api";
import { apiClient } from "@/lib/api-client";

interface WishlistItemWithProduct {
  variantId: string;
  product: any;
  variant: any;
}

export default function WishlistPage() {
  const router = useRouter();
  const { wishlistId, isInitializing } = useWishlistId();
  const {
    data: wishlistItems,
    isLoading: isLoadingItems,
    refetch,
  } = useWishlistItems(wishlistId);
  const [itemsWithProducts, setItemsWithProducts] = useState<
    WishlistItemWithProduct[]
  >([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Process enriched wishlist items from backend
  useEffect(() => {
    if (!wishlistItems || wishlistItems.length === 0) {
      setItemsWithProducts([]);
      return;
    }

    setIsLoadingProducts(true);
    try {
      // Backend now returns enriched data with product and variant
      console.log("Enriched wishlist items from backend:", wishlistItems);

      const processedItems = wishlistItems.map((item: any) => ({
        variantId: item.variantId,
        product: item.product,
        variant: item.variant,
      }));

      setItemsWithProducts(processedItems);
    } catch (error) {
      console.error("Failed to process wishlist items:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [wishlistItems]);

  const handleRemoveItem = () => {
    refetch();
  };

  const isLoading = isInitializing || isLoadingItems || isLoadingProducts;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EFECE5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#232D35]" />
          <p
            className="text-[14px] text-[#232D35]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Loading your wishlist...
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!itemsWithProducts || itemsWithProducts.length === 0) {
    return (
      <div className="min-h-screen bg-[#EFECE5]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16">
          {/* Header */}
          <div className="mb-12">
            <h1
              className="text-[32px] md:text-[40px] font-normal tracking-wide text-[#232D35] mb-2"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              My Wishlist
            </h1>
            <p
              className="text-[14px] text-gray-600"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Save your favorite items for later
            </p>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-[#BBA496]/20">
            <div className="w-20 h-20 rounded-full bg-[#EFECE5] flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-[#765C4D]" />
            </div>
            <h2
              className="text-[24px] font-normal text-[#232D35] mb-3"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              Your wishlist is empty
            </h2>
            <p
              className="text-[14px] text-gray-600 mb-8 text-center max-w-md"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Start adding items you love to your wishlist. Click the heart icon
              on any product to save it here.
            </p>
            <button
              onClick={() => router.push("/collections")}
              className="h-[48px] px-8 bg-[#232D35] text-[#E5E0D6] text-[14px] font-medium leading-[16px] tracking-[2px] uppercase hover:bg-[#1a2129] transition-colors"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              CONTINUE SHOPPING
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFECE5]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 pt-2 pb-12 md:pt-4 md:pb-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <h1
              className="text-[32px] md:text-[40px] font-normal tracking-wide text-[#232D35]"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              My Wishlist
            </h1>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-[#232D35] text-[#232D35]" />
              <span
                className="text-[14px] text-[#232D35] font-medium"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                {itemsWithProducts.length}{" "}
                {itemsWithProducts.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>
          <p
            className="text-[14px] text-gray-600"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Your saved favorites
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {itemsWithProducts.map((item) => {
            const product = item.product;
            const variant = item.variant;

            // Skip items without product or variant data
            if (!product || !variant) {
              console.warn(
                "[Wishlist] Skipping item without product/variant data:",
                item,
              );
              return null;
            }

            // Extract image from media array
            let imageUrl = "/images/products/product-1.jpg"; // Default fallback

            if (
              product.media &&
              Array.isArray(product.media) &&
              product.media.length > 0
            ) {
              const firstMedia = product.media[0];
              // Check if media has asset relation with storageKey
              if (firstMedia?.asset?.storageKey) {
                imageUrl = firstMedia.asset.storageKey;
              }
            }

            console.log(
              `[Wishlist] ${product.title}: Image=${imageUrl}, Inventory=${variant.onHand}, Price=${variant.price}`,
            );

            // The variant should already be normalized with numeric price
            const variantPrice =
              typeof variant.price === "number"
                ? variant.price
                : parseFloat(String(variant.price)) || 0;

            return (
              <WishlistProductCard
                key={item.variantId}
                wishlistId={wishlistId!}
                variantId={item.variantId}
                productId={product.id}
                slug={product.slug}
                title={product.title}
                price={variantPrice}
                image={imageUrl}
                variant={{
                  id: variant.id,
                  size: variant.size,
                  color: variant.color,
                  sku: variant.sku,
                  inventory: variant.onHand || 0,
                  price: variantPrice,
                }}
                allVariants={[]}
                onRemove={handleRemoveItem}
              />
            );
          })}
        </div>

        {/* Continue Shopping Button */}
        <div className="mt-16 flex justify-center">
          <button
            onClick={() => router.push("/collections")}
            className="h-[48px] px-8 bg-transparent border-2 border-[#232D35] text-[#232D35] text-[14px] font-medium leading-[16px] tracking-[2px] uppercase hover:bg-[#232D35] hover:text-[#E5E0D6] transition-colors"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  );
}
