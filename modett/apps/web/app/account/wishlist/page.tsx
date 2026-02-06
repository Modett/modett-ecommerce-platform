"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useWishlistId, useWishlistItems } from "@/features/engagement/queries";
import { WishlistProductCard } from "@/features/engagement/components/wishlist-product-card";

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#232D35]" />
          <p
            className="text-[14px] text-[#232D35]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#EFECE5]">
      <div className="flex flex-col items-center w-full">
        {/* Top Navigation Strip - Full width container with max-width content */}
        <div className="w-full flex justify-center border-t border-b border-[#C3B0A5]/30">
          <div className="w-full max-w-[1440px] px-4 md:px-[60px] h-[94px] flex items-center">
            <Link
              href="/account"
              className="text-[16px] font-medium leading-[20px] tracking-[0.02em] text-[#765C4D] hover:text-[#232D35] transition-colors"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Back to Modett Account
            </Link>
          </div>
        </div>

        {/* Content Container */}
        <div className="w-full max-w-[1440px] px-4 md:px-[60px] pb-12 md:pb-16 pt-[60px]">
          {/* Header Content */}
          <div className="flex flex-col items-center justify-center mb-16 relative">
            <h1
              className="text-[24px] font-medium text-[#765C4D] mb-4 text-center tracking-normal"
              style={{
                fontFamily: "Raleway, sans-serif",
                lineHeight: "1.4",
              }}
            >
              Wishlist
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center w-full relative">
              <p
                className="text-[14px] font-normal text-[#765C4D] text-center tracking-normal"
                style={{
                  fontFamily: "Raleway, sans-serif",
                  lineHeight: "24px",
                }}
              >
                You have collected {itemsWithProducts.length} product/s in your
                Wishlist.
              </p>

              {/* Share Link position absolute on desktop, static on mobile */}
              <button
                className="mt-4 md:mt-0 md:absolute md:right-0 text-[12px] text-[#A69588] hover:text-[#232D35] transition-colors tracking-wide"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Share your Wishlist
              </button>
            </div>
          </div>

          {/* Empty State */}
          {!itemsWithProducts || itemsWithProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p
                className="text-[14px] text-[#555555] mb-8 font-light"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Your wishlist is currently empty.
              </p>
              <button
                onClick={() => router.push("/collections")}
                className="h-[48px] px-8 bg-[#232D35] text-[#E5E0D6] text-[12px] font-medium leading-[16px] tracking-[2px] uppercase hover:bg-[#1a2129] transition-colors"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            /* Products Grid - 2 Column Layout - Constrained to 1248px */
            <div className="w-full max-w-[1248px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[40px] gap-y-[40px]">
                {itemsWithProducts.map((item) => {
                  const product = item.product;
                  const variant = item.variant;

                  if (!product || !variant) return null;

                  // Extract image from media array
                  let imageUrl = "/images/products/product-1.jpg";

                  if (
                    product.media &&
                    Array.isArray(product.media) &&
                    product.media.length > 0
                  ) {
                    const firstMedia = product.media[0];
                    if (firstMedia?.asset?.storageKey) {
                      imageUrl = firstMedia.asset.storageKey;
                    }
                  }

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
                        sku: variant.sku || "N/A", // Fallback for SKU
                        inventory: variant.onHand || 0,
                        price: variantPrice,
                      }}
                      allVariants={[]}
                      material={item.product?.material}
                      onRemove={handleRemoveItem}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
