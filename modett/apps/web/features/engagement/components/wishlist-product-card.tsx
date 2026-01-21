"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, X, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useAddToCart } from "@/features/cart/queries";
import { useRemoveFromWishlist } from "@/features/engagement/queries";
import { toast } from "sonner";
import { getColorHex } from "@/lib/colors";
import { TEXT_STYLES, PRODUCT_CLASSES } from "@/features/cart/constants/styles";

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
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCartMutation = useAddToCart();
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const availableColors = [
    ...new Set(allVariants.map((v) => v.color).filter(Boolean)),
  ];

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

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCartMutation.mutateAsync({
        variantId: variant.id,
        quantity: 1,
      });
      toast.success(`${title} added to cart!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="group bg-[#EFECE5] flex flex-col w-full gap-[16px]">
      {/* Image Container */}
      <div className="relative w-full h-[420px] overflow-hidden bg-transparent">
        <Link
          href={`/product/${slug}`}
          className="block w-full h-full relative"
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Remove button */}
        <button
          onClick={handleRemoveFromWishlist}
          disabled={isRemoving}
          className={`absolute top-3 right-3 z-20 w-[32px] h-[32px] flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 bg-white/90 backdrop-blur-sm ${
            isRemoving ? "opacity-50 cursor-wait" : "hover:bg-white"
          }`}
          title="Remove from wishlist"
        >
          <X className="w-[18px] h-[18px] text-[#232D35]" strokeWidth={2} />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-[12px] px-[20px] pb-[20px]">
        <div className="flex flex-col gap-[4px]">
          <Link href={`/product/${slug}`}>
            <h3
              className="text-[18px] leading-[28px] font-normal tracking-[0%] hover:underline cursor-pointer"
              style={TEXT_STYLES.bodyGraphite}
            >
              {title}
            </h3>
          </Link>
          <div className="flex items-center gap-2">
            <p
              className="text-[14px] leading-[24px] font-normal"
              style={{ ...TEXT_STYLES.bodyGraphite, letterSpacing: "1.03px" }}
            >
              Rs {price.toFixed(2)}
            </p>
            {/* {variant.size && (
              <span
                className="text-[12px] text-gray-500"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                • Size {variant.size}
              </span>
            )} */}
          </div>
        </div>

        {/* Color swatches */}
        {availableColors.length > 0 && (
          <div className="flex gap-[9px]">
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
            {availableColors.length > 4 && (
              <span
                className="text-[10px] text-gray-500 ml-1"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                +{availableColors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={variant.inventory === 0 || isAddingToCart}
          className={`h-[48px] ${PRODUCT_CLASSES.addToCartButton} bg-[#232D35] text-[#E5E0D6] text-[14px] font-medium leading-[16px] tracking-[2px] uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors w-full mt-2`}
          style={TEXT_STYLES.button}
        >
          {isAddingToCart ? (
            <span className="flex items-center justify-center gap-2">
              <ShoppingBag className="h-4 w-4 animate-pulse" />
              ADDING...
            </span>
          ) : variant.inventory === 0 ? (
            "OUT OF STOCK"
          ) : (
            "ADD TO CART"
          )}
        </button>
      </div>
    </div>
  );
}
