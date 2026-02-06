"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";
import { useRemoveFromWishlist } from "@/features/engagement/queries";
import { toast } from "sonner";
import { TEXT_STYLES } from "@/features/cart/constants/styles";

interface Variant {
  id: string;
  size?: string;
  color?: string;
  sku: string;
  inventory: number;
  price: number;
}

interface WishlistProductCardProps {
  wishlistId: string;
  variantId: string;
  productId: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  variant: Variant;
  allVariants: Variant[];
  material?: string;
  onRemove?: () => void;
}

export function WishlistProductCard({
  wishlistId,
  variantId,
  productId,
  slug,
  title,
  price,
  image,
  variant,
  allVariants,
  material,
  onRemove,
}: WishlistProductCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const handleRemoveFromWishlist = async () => {
    setIsRemoving(true);
    try {
      await removeFromWishlistMutation.mutateAsync({
        wishlistId,
        variantId,
        productId,
      });
      toast.success(`${title} removed from wishlist`);
      onRemove?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove from wishlist");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="group flex w-full gap-[24px] bg-transparent">
      {/* Image Container - Left Side */}
      <div className="relative w-[222.33px] h-[311.25px] shrink-0 overflow-hidden bg-[#F0F0F0]">
        <Link
          href={`/product/${slug}`}
          className="block w-full h-full relative"
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 240px"
          />
        </Link>
        <button
          onClick={handleRemoveFromWishlist}
          disabled={isRemoving}
          className={`absolute top-2 right-2 z-20 w-[24px] h-[24px] flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-all ${
            isRemoving ? "opacity-50 cursor-wait" : ""
          }`}
          title="Remove from wishlist"
        >
          <X className="w-[14px] h-[14px] text-[#232D35]" />
        </button>
      </div>

      {/* Product Info - Right Side */}
      <div className="flex flex-col flex-1 py-1 w-full max-w-[317.66px]">
        <div className="flex flex-col gap-1 mb-6">
          <Link href={`/product/${slug}`}>
            <h3
              className="text-[24px] leading-[30px] font-normal text-[#232D35]"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              {title}
            </h3>
          </Link>
          {/* Collection/Category - Salmon color as per design */}
          <span
            className="text-[12px] text-[#C78869] font-medium tracking-wide uppercase"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {material || "Cotton"}
          </span>
          {/* SKU */}
          <span
            className="text-[10px] text-[#A69588] tracking-[0.15em] uppercase mt-1"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {variant.sku}
          </span>
        </div>

        {/* Price Section */}
        <div className="h-[48px] flex items-start border-b border-[#E5E0D6]">
          <p
            className="text-[18px] font-normal text-[#232D35]"
            style={{
              fontFamily: "Raleway, sans-serif",
            }}
          >
            Rs{" "}
            {price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Variants Info */}
        <div className="flex flex-col">
          {variant.color && (
            <div
              className="h-[57px] w-[301.66px] flex items-center text-[16px] text-[#232D35] border-b border-[#E5E0D6]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              <span className="text-[#232D35]">Color: {variant.color}</span>
            </div>
          )}
          {
            /* Keep size for now but style broadly similar or auto if not specified */
            <div
              className="h-[57px] w-[301.66px] flex items-center text-[16px] text-[#232D35] border-b border-[#E5E0D6]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              <span className="text-[#232D35]">
                Size: {variant.size || "One Size"}
              </span>
            </div>
          }
        </div>

        {/* Footer Link */}
        <div className="mt-4">
          <div
            className="flex items-center gap-1 text-[14px] leading-[24px] text-[#888888]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <span>Access full product description:</span>
            <Link
              href={`/product/${slug}`}
              className="text-[#C78869] underline hover:text-[#a06d54] transition-colors"
            >
              Product details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
