"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  currency?: string;
  image: string;
  rating?: number;
  totalReviews?: number;
  sizes?: string[];
  sizeToVariantId?: Record<string, string>;
  defaultVariantId?: string;
  handle: string;
  onAddToCart?: (productId: string, size: string) => void;
  onToggleWishlist?: (variantId: string) => void;
  isInWishlist?: (variantId: string) => boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  currency = "Rs",
  image,
  sizes,
  sizeToVariantId,
  defaultVariantId,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
}) => {
  const [selectedSize, setSelectedSize] = React.useState<string>("");
  const [isHovered, setIsHovered] = React.useState(false);
  const activeVariantId =
    (selectedSize && sizeToVariantId?.[selectedSize]) ||
    defaultVariantId ||
    (sizeToVariantId && Object.values(sizeToVariantId)[0])

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      if (!activeVariantId) {
        console.warn(
          "Wishlist toggle aborted: no variantId available for product",
          id,
        );
        return;
      }
      onToggleWishlist(activeVariantId);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart && selectedSize) {
      onAddToCart(id, selectedSize);
    }
  };

  const handleCardClick = () => {
    setIsHovered(!isHovered);
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.stopPropagation();
    setSelectedSize(size);
  };

  // Default sizes if not provided
  const availableSizes =
    sizes && sizes.length > 0
      ? sizes
      : ["34", "36", "38", "40", "42", "44", "48", "50"];

  return (
    <div
      className="bg-[#f5f3ef] rounded-none overflow-hidden shadow-none group"
    >
      <div className="relative">
        <img src={image} alt={name} className="w-full h-[400px] object-cover" />
        <button
          onClick={(e) => handleWishlistToggle(e)}
          className="absolute top-4 right-4 transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart
            className={cn(
              "h-6 w-6 stroke-[1.5]",
              activeVariantId && isInWishlist?.(activeVariantId)
                ? "fill-red-500 text-red-500"
                : "text-white fill-none"
            )}
          />
        </button>
        {/* Hover Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 flex flex-col justify-end items-center transition-all duration-300 ease-in-out ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ background: "rgba(239, 236, 229, 0.80)" }}
        >
          <div className="w-full px-4 py-4">
            <div className="text-center text-[12px] text-[#232d35] mb-3 font-semibold tracking-wider">
              Available sizes
            </div>
            <div className="flex justify-center flex-wrap gap-1.5 mb-4">
              {availableSizes.map((size: string) => (
                <button
                  key={size}
                  className={`px-2.5 py-1.5 text-[12px] font-normal font-sans transition-all border ${
                    selectedSize === size
                      ? "bg-[#232d35] text-white border-[#232d35]"
                      : "bg-white text-gray-800 border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={(e) => handleSizeSelect(e, size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              className="w-full py-3 bg-[#2c353c] text-white font-medium text-[13px] tracking-[0.15em] uppercase transition-colors hover:bg-[#1e252b] cursor-pointer"
              onClick={(e) => handleAddToCart(e)}
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-start justify-between px-4 py-3">
        <div>
          <div className="text-lg font-medium text-gray-800">{name}</div>
          <div className="text-sm text-[#7c6652] mt-1">
            {currency} {price.toFixed(2)}
          </div>
          <div className="flex space-x-2 mt-2">
            <span className="w-4 h-4 rounded-full bg-[#c6866a] inline-block"></span>
            <span className="w-4 h-4 rounded-full bg-[#cbb78a] border border-[#6b5a43] inline-block"></span>
            <span className="w-4 h-4 rounded-full bg-[#c7d3d1] inline-block"></span>
            <span className="w-4 h-4 rounded-full bg-[#c7d3d1] inline-block"></span>
          </div>
        </div>
        <button
          className="text-3xl text-[#7c6652] font-light pt-0"
          aria-label={isHovered ? "Close" : "Add to cart"}
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          {isHovered ? "−" : "+"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
