"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

interface CartItemProps {
  cartItemId: string;
  productId: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  color?: string;
  size?: string;
  quantity: number;
  onQuantityChange: (cartItemId: string, newQuantity: number) => void;
  onRemove: (cartItemId: string) => void;
}

export function CartItem({
  cartItemId,
  productId,
  slug,
  title,
  price,
  image,
  color,
  size,
  quantity,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    try {
      await onQuantityChange(cartItemId, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await onRemove(cartItemId);
    } finally {
      setIsUpdating(false);
    }
  };

  const totalPrice = price * quantity;

  return (
    <div className="w-full border-b border-[#E8F5F2] py-[16px] bg-[#E5E0D6]">
      <div className="flex px-[16px] items-center gap-[24px]">
        <div className="w-[149.61px]">
          <Link href={`/product/${slug}`} className="block w-fit">
            <div className="relative w-[149.61px] h-[190.88px] bg-gray-100 overflow-hidden">
              <Image src={image} alt={title} fill className="object-cover" />
            </div>
          </Link>
        </div>

        <div className="w-[342.02px] flex flex-col gap-[29px] h-[190.88px] pl-[20px]">
          <div className="flex flex-col gap-[4px]">
            <span
              className="text-[10px] leading-[24px] font-normal tracking-[2px] uppercase"
              style={{
                fontFamily: "Reddit Sans, sans-serif",
                color: "#BBA496",
              }}
            >
              SKU: {productId.substring(0, 12)}...
            </span>
            <Link href={`/product/${slug}`}>
              <h3
                className="text-[18px] leading-[26px] font-normal hover:underline"
                style={{
                  fontFamily: "Playfair Display, serif",
                  color: "#232D35",
                }}
              >
                {title}
              </h3>
            </Link>
          </div>

          <div className="flex flex-col gap-[4px]">
            {color && (
              <p
                className="text-[14px] leading-[24px] font-normal uppercase tracking-[1.03px] w-[362px] h-[24px]"
                style={{ fontFamily: "Raleway, sans-serif", color: "#3E5460" }}
              >
                COLOUR: <span className="text-[#3E5460]">{color}</span>
              </p>
            )}
            {size && (
              <p
                className="text-[14px] leading-[24px] font-normal tracking-[1.03px] w-[362px] h-[24px]"
                style={{ fontFamily: "Raleway, sans-serif", color: "#3E5460" }}
              >
                Size: {size}
              </p>
            )}
          </div>

          <button
            className="text-[12px] leading-[16px] w-[83px] h-[16px] text-center"
            style={{ fontFamily: "Reddit Sans, sans-serif", color: "#3E5460" }}
          >
            Product details
          </button>
        </div>

        {/* Quantity */}
        <div className="w-[70px] pr-[14.8px]">
          <div
            className="flex items-center border border-[#BBA496] min-h-[44px] w-fit bg-[#E5E0D6] -ml-[30px]"
            style={{ backgroundColor: "#E5E0D6" }}
          >
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="w-auto h-[44px] px-[5px] pt-[1px] pb-[1px] flex items-center justify-center bg-[#E5E0D6] hover:bg-[#D4C4A8] disabled:opacity-50 disabled:cursor-not-allowed text-[#232D35]"
              style={{
                fontFamily: "Raleway, sans-serif",
                backgroundColor: "#E5E0D6",
              }}
            >
              −
            </button>
            <span
              className="w-auto h-[44px] px-[5px] pt-[1px] pb-[1px] flex items-center justify-center text-[14px] font-medium"
              style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
            >
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className="w-auto h-[44px] px-[5px] pt-[1px] pb-[1px] flex items-center justify-center bg-[#E5E0D6] hover:bg-[#D4C4A8] text-[#232D35]"
              style={{
                fontFamily: "Raleway, sans-serif",
                backgroundColor: "#E5E0D6",
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="w-[112px] flex items-center justify-end gap-[16px]">
          <p
            className="text-[14px] leading-[24px] font-normal tracking-[1.03px] w-[86px] h-[24px] whitespace-nowrap"
            style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
          >
            Rs {totalPrice.toFixed(2)}
          </p>
          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-[#765C4D] hover:text-[#232D35] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-[13.3px] h-[13.3px]" strokeWidth={1} />
          </button>
        </div>
      </div>
    </div>
  );
}
