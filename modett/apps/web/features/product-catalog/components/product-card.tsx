"use client";

import Image from "next/image";
import { Heart, Plus, Minus, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { cartService } from "@/services/cart.service";
import { wishlistService } from "@/services/wishlist.service";
import { toast } from "sonner";

// Color mapping for common color names to hex codes
const COLOR_MAP: Record<string, string> = {
  "terracotta clay": "#C78869",
  "brushed gold": "#C1AB85",
  "sage green": "#8FA89A",
  "dusty blue": "#9EAFB0",
  red: "#DC2626",
  blue: "#2563EB",
  green: "#16A34A",
  yellow: "#CA8A04",
  purple: "#9333EA",
  pink: "#EC4899",
  black: "#000000",
  white: "#FFFFFF",
  gray: "#6B7280",
  brown: "#92400E",
  beige: "#D4C4A8",
  navy: "#1E3A8A",
  cream: "#F5F5DC",
};

const getColorHex = (colorName: string | undefined): string => {
  if (!colorName) return "#CCCCCC";
  const normalizedName = colorName.toLowerCase().trim();

  if (colorName.startsWith("#")) return colorName;

  return COLOR_MAP[normalizedName] || "#CCCCCC";
};

interface Variant {
  id: string;
  size?: string;
  color?: string;
  sku: string;
  inventory: number;
}

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  variants: Variant[];
  rating?: number;
}

export function ProductCard({
  title,
  price,
  image,
  variants,
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const defaultVariant = variants[0];

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (defaultVariant) {
        try {
          const inWishlist = await wishlistService.isInWishlist(
            defaultVariant.id
          );
          setIsWishlisted(inWishlist);
        } catch (error) {}
      }
    };

    checkWishlistStatus();
  }, [defaultVariant?.id]);

  const availableSizes = Array.from(
    new Set(variants.map((v) => v.size).filter(Boolean))
  );

  const availableColors = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean))
  );

  const handleSizeSelect = (size: string) => {
    const variant = variants.find((v) => v.size === size);
    setSelectedVariant(variant || null);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Please select a size");
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartService.addToCart({
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

  const handleWishlistToggle = async () => {
    if (!defaultVariant) {
      toast.error("Product variant not available");
      return;
    }

    setIsTogglingWishlist(true);
    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(defaultVariant.id);
        setIsWishlisted(false);
        toast.success(`${title} removed from wishlist`);
      } else {
        await wishlistService.addToWishlist(defaultVariant.id);
        setIsWishlisted(true);
        toast.success(`${title} added to wishlist!`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update wishlist");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <div className="group bg-[#EFECE5] w-full max-w-[350px] md:max-w-[394px] h-[592px] md:h-[600px] flex flex-col gap-[19.27px]">
      <div className="relative w-full h-[493px] md:h-[501.54px] overflow-hidden bg-gray-50">
        <Image src={image} alt={title} fill className="object-cover" />

        <button
          onClick={handleWishlistToggle}
          disabled={isTogglingWishlist}
          className={`absolute top-[18px] right-[18px] w-5 h-5 transition-all z-10 disabled:opacity-50 cursor-pointer flex items-center justify-center ${
            isWishlisted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-5 w-5 transition-all ${
              isWishlisted ? "fill-black text-black" : "text-[#232D35]"
            } ${isTogglingWishlist ? "animate-pulse" : ""}`}
          />
        </button>

        {isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 w-[394px] bg-[#F8F5F2]/75 pt-[16px] pr-[14px] pb-[16px] pl-[14px] flex flex-col gap-[6px] border-t-[0.5px] border-[#BBA496]">
            <p
              className="text-[12px] leading-[16px] font-normal text-center text-gray-600"
              style={{ fontFamily: "Reddit Sans", letterSpacing: "0px" }}
            >
              {availableSizes.length > 0 ? "Available sizes" : "Select variant"}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size!)}
                  className={`py-1.5 text-xs font-medium border transition-colors ${
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
              className="w-[368px] h-[48px] bg-[#232D35] hover:bg-[#232D35]/90 text-[#E5E0D6] text-[16px] leading-[24px] font-medium tracking-[4px] uppercase disabled:opacity-50 cursor-pointer rounded-sm transition-colors"
              style={{ fontFamily: "Raleway" }}
            >
              {isAddingToCart ? (
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 animate-pulse" />
                  ADDING...
                </span>
              ) : (
                "ADD TO CART"
              )}
            </button>
          </div>
        )}
      </div>

      <div className="relative h-[79.19px] py-1 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex-1 max-w-[232.11px] w-[164.51px] h-[54.31px]">
            <h3
              className="text-[18px] leading-[24px] font-normal text-[#232D35] tracking-[0%]"
              style={{ fontFamily: "Raleway" }}
            >
              {title}
            </h3>
            <p
              className="text-[14px] leading-[24px] font-normal text-[#232D35]"
              style={{ fontFamily: "Raleway", letterSpacing: "1.03px" }}
            >
              Rs {price.toFixed(2)}
            </p>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-[29.86px] h-[29.86px] flex items-center justify-center hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <Minus
                className="w-[19.91px] h-[19.91px] text-[#232D35]"
                strokeWidth={2.49}
              />
            ) : (
              <Plus
                className="w-[19.91px] h-[19.91px] text-[#232D35]"
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
                className="w-3 h-3 rounded-full border"
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
