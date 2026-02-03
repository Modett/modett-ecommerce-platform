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
      <div className="relative w-[240px] h-[320px] shrink-0 overflow-hidden bg-[#F0F0F0]">
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

        {/* Remove button overlay on image if needed by design, or keep it separate. 
            Design usually implies a clean image. Let's put remove button in content or keep as hover?
            The image reference doesn't clearly show a remove 'button' on the card, but usually there is one. 
            I'll keep the top-right overlay for UX, styled consistently.
        */}
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
      <div className="flex flex-col flex-1 py-1 w-full">
        <div className="flex flex-col gap-1 mb-6">
          <Link href={`/product/${slug}`}>
            <h3
              className="text-[20px] leading-[26px] font-normal text-[#232D35]"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              {title}
            </h3>
          </Link>
          {/* Collection/Category - Salmon color as per design */}
          <span
            className="text-[12px] text-[#D4A373] font-medium tracking-wide uppercase"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Cotton
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
        <div className="pb-4 border-b border-[#E5E0D6]">
          <p
            className="text-[14px] font-medium text-[#232D35]"
            style={{
              fontFamily: "Raleway, sans-serif",
              letterSpacing: "0.5px",
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
              className="flex items-center gap-2 text-[13px] text-[#555555] py-3 border-b border-[#E5E0D6]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              <span className="text-[#888888]">Color:</span>
              <span>{variant.color}</span>
            </div>
          )}
          {
            <div
              className="flex items-center gap-2 text-[13px] text-[#555555] py-3 border-b border-[#E5E0D6]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              <span className="text-[#888888]">Size:</span>
              <span>{variant.size || "One Size"}</span>
            </div>
          }
        </div>

        {/* Footer Link */}
        <div className="mt-4">
          <div
            className="flex items-center gap-1 text-[12px] text-[#888888]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <span>Access full product description:</span>
            <Link
              href={`/product/${slug}`}
              className="text-[#D4A373] underline hover:text-[#b0825a] transition-colors decoration-[#D4A373]/50 underline-offset-4"
            >
              Product details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
