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
  variant?: "home" | "collection";
}

export function ProductCard({
  productId,
  slug,
  title,
  price,
  image,
  variants,
  variant = "home",
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
        variant === "collection"
          ? "w-full h-[480px] md:h-[498px] lg:h-[516px] gap-[15px] md:gap-[15.5px] lg:gap-[16px]"
          : "w-full max-w-[350px] md:max-w-[370px] lg:max-w-[394px] h-[502px] md:h-[502px] lg:h-[520px] gap-[18px] md:gap-[18.5px] lg:gap-[19.27px]"
      }`}
    >
      <div
        className={`relative w-full overflow-hidden bg-gray-50 ${
          variant === "collection"
            ? "h-[375px] md:h-[387px] lg:h-[400px]"
            : "h-[428px] md:h-[406px] lg:h-[420px]"
        }`}
      >
        <Link href={`/product/${slug}`} className="block w-full h-full">
          <Image src={image} alt={title} fill className="object-cover" />
        </Link>

        <button
          onClick={handleWishlistToggle}
          disabled={isTogglingWishlist}
          className={`absolute top-[16px] md:top-[17px] lg:top-[18px] right-[16px] md:right-[17px] lg:right-[18px] w-[18px] md:w-[19px] lg:w-5 h-[18px] md:h-[19px] lg:h-5 transition-all z-10 disabled:opacity-50 cursor-pointer flex items-center justify-center ${
            isWishlisted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-[18px] md:h-[19px] lg:h-5 w-[18px] md:w-[19px] lg:w-5 transition-all ${
              isWishlisted ? "fill-black text-black" : "text-white"
            } ${isTogglingWishlist ? "animate-pulse" : ""}`}
          />
        </button>

        {isExpanded && (
          <div
            className={`absolute bottom-0 left-0 right-0 bg-[#F8F5F2]/75 pt-[14px] md:pt-[15px] lg:pt-[16px] pr-[12px] md:pr-[13px] lg:pr-[14px] pb-[14px] md:pb-[15px] lg:pb-[16px] pl-[12px] md:pl-[13px] lg:pl-[14px] flex flex-col gap-[5px] md:gap-[5.5px] lg:gap-[6px] border-t-[0.5px] border-[#BBA496] ${
              variant === "collection"
                ? "w-full"
                : "w-[330px] md:w-[370px] lg:w-[394px]"
            }`}
          >
            <p
              className="text-[11px] md:text-[11.5px] lg:text-[12px] leading-[15px] md:leading-[15.5px] lg:leading-[16px] font-normal text-center text-gray-600"
              style={TEXT_STYLES.sku}
            >
              {availableSizes.length > 0 ? "Available sizes" : "Select variant"}
            </p>
            <div
              className={`grid gap-[7px] md:gap-[7.5px] lg:gap-2 ${
                variant === "collection" ? "grid-cols-4" : "grid-cols-5"
              }`}
            >
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size!)}
                  className={`py-1 md:py-1.5 text-[11px] md:text-[11.5px] lg:text-xs font-medium border transition-colors ${
                    selectedVariant?.size === size
                      ? "bg-gray-800 text-white border-gray-800"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || isAddingToCart}
              className={`h-[44px] md:h-[46px] lg:h-[48px] ${PRODUCT_CLASSES.addToCartButton} text-[#E5E0D6] text-[15px] md:text-[15.5px] lg:text-[16px] leading-[23px] md:leading-[23.5px] lg:leading-[24px] disabled:opacity-50 cursor-pointer rounded-sm transition-colors ${
                variant === "collection"
                  ? "w-full"
                  : "w-[306px] md:w-[344px] lg:w-[368px]"
              }`}
              style={TEXT_STYLES.button}
            >
              {isAddingToCart ? (
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-[15px] md:h-[15.5px] lg:h-4 w-[15px] md:w-[15.5px] lg:w-4 animate-pulse" />
                  ADDING...
                </span>
              ) : (
                "ADD TO CART"
              )}
            </button>
          </div>
        )}
      </div>

      <div className="relative h-[74px] md:h-[76px] lg:h-[79.19px] py-[3px] md:py-[3.5px] lg:py-1 pl-[20px] pr-[24px] flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex-1 max-w-[217px] md:w-[153px] lg:w-[164.51px] md:max-w-[224px] lg:max-w-[232.11px] h-[50px] md:h-[52px] lg:h-[54.31px]">
            <Link href={`/product/${slug}`}>
              <h3
                className="text-[17px] md:text-[17.5px] lg:text-[18px] leading-[23px] md:leading-[23.5px] lg:leading-[24px] font-normal tracking-[0%] hover:underline cursor-pointer"
                style={TEXT_STYLES.bodyGraphite}
              >
                {title}
              </h3>
            </Link>
            <p
              className="text-[13px] md:text-[13.5px] lg:text-[14px] leading-[23px] md:leading-[23.5px] lg:leading-[24px] font-normal"
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
          <div className="flex gap-[8px] md:gap-[8.5px] lg:gap-[9px] w-[109px] md:w-[113px] lg:w-[117px] h-[11px] md:h-[11.5px] lg:h-[12px]">
            {availableColors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-[11px] md:w-[11.5px] lg:w-3 h-[11px] md:h-[11.5px] lg:h-3 rounded-full border"
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
