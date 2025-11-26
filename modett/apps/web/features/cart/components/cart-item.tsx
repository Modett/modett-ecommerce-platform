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
    <div className="w-full border-b border-[#E5E0D6] py-[24px]">
      <div className="grid grid-cols-12 gap-[16px] items-center">
        {/* Product Image (Col span 5) */}
        <div className="col-span-5">
          <Link href={`/product/${slug}`} className="block w-fit">
            <div className="relative w-[120px] h-[150px] bg-gray-100 overflow-hidden">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
              />
            </div>
          </Link>
        </div>

        {/* Description (Col span 3) */}
        <div className="col-span-3 flex flex-col gap-[8px]">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[10px] leading-[14px] font-medium tracking-[1px] text-[#6B7B8A] uppercase">
              SKU: {productId.substring(0, 12)}...
            </span>
            <Link href={`/product/${slug}`}>
              <h3
                className="text-[18px] leading-[26px] font-normal hover:underline"
                style={{ fontFamily: "Playfair Display, serif", color: "#232D35" }}
              >
                {title}
              </h3>
            </Link>
          </div>

          <div className="flex flex-col gap-[4px] mt-[8px]">
            {color && (
              <p
                className="text-[12px] leading-[18px] font-medium uppercase tracking-[1px]"
                style={{ fontFamily: "Raleway, sans-serif", color: "#6B7B8A" }}
              >
                COLOUR: <span className="text-[#232D35]">{color}</span>
              </p>
            )}
            {size && (
              <p
                className="text-[14px] leading-[20px] font-normal"
                style={{ fontFamily: "Raleway, sans-serif", color: "#6B7B8A" }}
              >
                Size: {size}
              </p>
            )}
          </div>
          
          <button className="text-[12px] underline text-[#6B7B8A] hover:text-[#232D35] w-fit mt-[8px]">
            Product details
          </button>
        </div>

        {/* Quantity (Col span 2) */}
        <div className="col-span-2">
          <div className="flex items-center border border-[#D4C4A8] w-fit bg-[#F3F0EB]">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="w-[32px] h-[32px] flex items-center justify-center hover:bg-[#E5E0D6] disabled:opacity-50 disabled:cursor-not-allowed text-[#232D35]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              −
            </button>
            <span
              className="w-[40px] h-[32px] flex items-center justify-center text-[14px] font-medium text-[#232D35]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdating}
              className="w-[32px] h-[32px] flex items-center justify-center hover:bg-[#E5E0D6] disabled:opacity-50 disabled:cursor-not-allowed text-[#232D35]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              +
            </button>
          </div>
        </div>

        {/* Price (Col span 2) */}
        <div className="col-span-2 flex items-center justify-end gap-[16px]">
          <p
            className="text-[16px] leading-[24px] font-medium"
            style={{ fontFamily: "Raleway, sans-serif", color: "#6B7B8A" }}
          >
            Rs {totalPrice.toFixed(2)}
          </p>
          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="text-[#6B7B8A] hover:text-[#232D35] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
