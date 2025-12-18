"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, Minus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useAddToCart } from "@/features/cart/queries";
import {
  useProductWishlist,
  useProductVariant,
} from "@/features/product-catalog/hooks";
import { toast } from "sonner";
import { getColorHex } from "@/lib/colors";
import {
  TEXT_STYLES,
  PRODUCT_CLASSES,
  COMMON_CLASSES,
} from "@/features/cart/constants/styles";

interface Variant {
  id: string;
  size?: string;
  color?: string;
  sku: string;
  inventory: number;
}

interface ProductCardProps {
  id: string;
  productId: string;
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  variants: Variant[];
  rating?: number;
  variant?: "home" | "collection" | "wear-it-with";
  aspectRatio?: string;
  textGap?: string;
}

export function ProductCard({
  productId,
  slug,
  title,
  price,
  image,
  variants,
  variant = "home",
  aspectRatio,
  textGap,
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCartMutation = useAddToCart();

  const variantIds = variants.map((v) => v.id);

  const { isWishlisted, isTogglingWishlist, toggleWishlist } =
    useProductWishlist({
      productId,
      variantIds,
      productTitle: title,
    });

  const {
    selectedVariant,
    defaultVariant,
    availableSizes,
    availableColors,
    handleSizeSelect,
  } = useProductVariant({ variants });

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Please select a size");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCartMutation.mutateAsync({
        variantId: selectedVariant.id,
        quantity: 1,
      });

      toast.success(`${title} added to cart!`);

      setTimeout(() => setIsExpanded(false), 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!defaultVariant) {
      toast.error("Product variant not available");
      return;
    }
    toggleWishlist(defaultVariant.id);
  };

  return (
    <div
      className={`group bg-[#EFECE5] flex flex-col ${
        textGap
          ? textGap
          : aspectRatio
            ? "w-full h-auto gap-[16.26px]"
            : variant === "collection"
              ? "w-full h-[592px] md:h-[496.96px] lg:h-[496.96px] gap-[15px] md:gap-[7.66px] lg:gap-[7.66px]"
              : variant === "wear-it-with"
                ? "w-full max-w-[350px] mx-auto gap-[12px]"
                : "w-full max-w-[350px] md:max-w-[370px] lg:max-w-[394px] h-[520px] md:h-[520px] lg:h-[520px] gap-[16px] md:gap-[16px] lg:gap-[16px]"
      }`}
    >
      <div
        className={`relative w-full overflow-hidden bg-transparent ${
          aspectRatio
            ? aspectRatio
            : variant === "collection"
              ? "h-[512px] md:h-[407.34px] lg:h-[407.34px]"
              : "h-[420px] md:h-[420px] lg:h-[420px]"
        }`}
      >
        <div className="relative h-full w-full">
          <div
            className={`relative w-full overflow-hidden group ${
              aspectRatio ? "h-full" : "h-full"
            }`}
          >
            <Link href={`/product/${slug}`} className="block w-full h-full">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </Link>
            {/* Wishlist button for all variants */}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-3 right-3 z-20 w-[32px] md:w-[32px] lg:w-[32px] h-[32px] md:h-[32px] lg:h-[32px] flex items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 bg-transparent ${isTogglingWishlist ? "opacity-50 cursor-wait" : ""}`}
            >
              <Heart
                className={`w-[20px] h-[20px] transition-colors ${
                  isWishlisted
                    ? "fill-[#232D35] text-[#232D35]"
                    : "text-white hover:text-gray-200"
                }`}
                strokeWidth={1.5}
              />
            </button>

            {/* Quick Add Overlay */}
            <div
              className={`absolute inset-x-0 bottom-0 transition-all duration-300 transform flex flex-col ${
                isExpanded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-full opacity-0"
              }`}
            >
              {/* Mobile Wrapper (preserved) / Desktop Sizes Section */}
              <div
                className={`w-full flex flex-col items-center
                  h-[85px] bg-[#F8F5F2]/75 backdrop-blur-sm px-[14px] py-[16px] gap-[6px] justify-center
                `}
              >
                <div className="w-full flex flex-col items-center gap-[6px]">
                  <p
                    className="text-center text-[#232D35] text-[14px] font-normal leading-[16px]"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Available sizes
                  </p>
                  <div className="flex flex-wrap justify-center items-center gap-6 w-full px-0">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size!)}
                        className={`text-[14px] font-normal transition-colors min-w-[24px] text-center ${
                          selectedVariant?.size === size
                            ? "text-[#232D35] border border-[#232D35] px-2 py-1"
                            : "text-[#232D35]/70 hover:text-[#232D35]"
                        }`}
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Button Section - Mobile & Desktop */}
              <div
                className={`w-full h-[69px] bg-[#F8F5F2]/75 backdrop-blur-sm border-t-[0.5px] border-[#BBA496] flex items-center justify-center`}
              >
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || isAddingToCart}
                  className={`h-[48px] ${PRODUCT_CLASSES.addToCartButton} bg-[#232D35] text-[#E5E0D6] text-[14px] font-medium leading-[16px] tracking-[2px] uppercase disabled:opacity-50 cursor-pointer transition-colors w-full max-w-[360px]`}
                  style={TEXT_STYLES.button}
                >
                  {isAddingToCart ? (
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingBag className="h-4 w-4 animate-pulse" />
                      ADDING...
                    </span>
                  ) : (
                    "ADD TO CART"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`relative flex flex-col justify-between ${
          variant === "wear-it-with"
            ? "h-[80px] py-[3px] md:py-[3.5px] lg:py-1 px-[16px]"
            : "h-[74px] md:h-[82px] lg:h-[82px] py-[3px] md:py-[3.5px] lg:py-1 pl-[20px] pr-[24px] md:px-[6px] lg:px-[6px]"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 w-full md:w-auto lg:w-auto md:max-w-none lg:max-w-none h-auto min-h-[50px] md:min-h-[52px] lg:min-h-[54.31px]">
            <Link href={`/product/${slug}`}>
              <h3
                className={`${
                  variant === "collection"
                    ? "text-[16px] leading-[20px] font-medium tracking-[0.02em]"
                    : "text-[18px] md:text-[18px] lg:text-[18px] leading-[28px] md:leading-[28px] lg:leading-[28px] font-normal tracking-[0%]"
                } hover:underline cursor-pointer`}
                style={TEXT_STYLES.bodyGraphite}
              >
                {title}
              </h3>
            </Link>
            <p
              className="text-[14px] leading-[24px] font-normal"
              style={{ ...TEXT_STYLES.bodyGraphite, letterSpacing: "1.03px" }}
            >
              Rs {price.toFixed(2)}
            </p>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-[28px] md:w-[28.9px] lg:w-[29.86px] h-[28px] md:h-[28.9px] lg:h-[29.86px] flex items-center justify-center hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <Minus
                className="w-[18.6px] md:w-[19.2px] lg:w-[19.91px] h-[18.6px] md:h-[19.2px] lg:h-[19.91px] text-[#232D35]"
                strokeWidth={2.49}
              />
            ) : (
              <Plus
                className="w-[18.6px] md:w-[19.2px] lg:w-[19.91px] h-[18.6px] md:h-[19.2px] lg:h-[19.91px] text-[#232D35]"
                strokeWidth={2.49}
              />
            )}
          </button>
        </div>

        {availableColors.length > 0 && (
          <div className="flex gap-[9px] w-[117px] h-[12px]">
            {availableColors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-[12px] h-[12px] rounded-full border"
                style={{
                  backgroundColor: getColorHex(color),
                  borderColor: "#765C4D",
                  borderWidth: "1px",
                }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
