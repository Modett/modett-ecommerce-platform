"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
  TEXT_STYLES,
  COMMON_CLASSES,
  SPACING,
  COLORS,
  RESPONSIVE,
} from "@/features/cart/constants/styles";

interface CartItemProps {
  cartItemId: string;
  productId: string;
  sku?: string;
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
  sku,
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
    <div
      className={`w-full ${COMMON_CLASSES.borderLight} py-3 md:py-4 lg:py-[16px] lg:bg-[#E5E0D6]`}
    >
      <div
        className={`flex px-0 md:px-4 lg:px-[16px] items-start lg:items-center ${RESPONSIVE.gap.item}`}
      >
        {/* Image */}
        <div className="w-[150px] md:w-[135px] lg:w-[149.61px]">
          <Link href={`/product/${slug}`} className="block w-fit">
            <div className="relative w-[150px] md:w-[135px] lg:w-[149.61px] h-[190.88px] md:h-[172px] lg:h-[190.88px] bg-gray-100 overflow-hidden">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover object-top"
              />
            </div>
          </Link>
        </div>

        {/* Details Column */}
        <div className="flex-1 md:w-[280px] lg:w-[342.02px] flex flex-col gap-[5px] md:gap-6 lg:gap-[29px] pl-3 md:pl-4 lg:pl-[20px]">
          {/* Header Info */}
          <div className="flex flex-col gap-1 lg:gap-[5px]">
            <span
              className="text-[8px] md:text-[9.5px] lg:text-[10px] leading-[24px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[2px] md:tracking-[1.7px] lg:tracking-[2px] uppercase w-fit md:w-auto -mt-[5px] md:mt-0 block whitespace-nowrap"
              style={{ ...TEXT_STYLES.sku, color: "#BBA496" }}
            >
              SKU: {sku || productId.substring(0, 12) + "..."}
            </span>
            <Link href={`/product/${slug}`}>
              <h3
                className="text-[22px] md:text-[17px] lg:text-[18px] leading-[28px] md:leading-[24px] lg:leading-[26px] font-normal tracking-normal hover:underline text-[#3E5460]"
                style={TEXT_STYLES.productTitle}
              >
                {title}
              </h3>
            </Link>
          </div>

          {/* Mobile Variants (Inline) */}
          <div className="lg:hidden flex flex-wrap items-center gap-x-4 mt-1">
            {color && (
              <span className="text-[14px] leading-[18px] font-light tracking-[0px] text-[#3E5460] uppercase">
                COLOUR: {color}
              </span>
            )}
            {color && size && (
              <span className="text-[14px] leading-[18px] font-light text-[#D2D2D2]">
                |
              </span>
            )}
            {size && (
              <span className="text-[13px] leading-[18px] font-light tracking-[0px] text-[#3E5460] uppercase">
                SIZE: {size}
              </span>
            )}
          </div>

          {/* Desktop Variants (Stacked) */}
          <div className={`hidden lg:flex flex-col ${SPACING.tinyGap}`}>
            {color && (
              <p
                className="text-[14px] md:text-[13px] lg:text-[14px] leading-[18px] md:leading-[22px] lg:leading-[24px] font-light tracking-normal md:tracking-[0.9px] lg:tracking-[1.03px] uppercase text-[#3E5460]"
                style={TEXT_STYLES.bodyTeal}
              >
                COLOUR: <span>{color}</span>
              </p>
            )}
            {size && (
              <p
                className="text-[13px] md:text-[13px] lg:text-[14px] leading-[18px] md:leading-[22px] lg:leading-[24px] font-light tracking-normal md:tracking-[0.9px] lg:tracking-[1.03px] uppercase text-[#3E5460]"
                style={TEXT_STYLES.bodyTeal}
              >
                Size: {size}
              </p>
            )}
          </div>

          {/* Mobile Quantity & Price Block */}
          <div className="lg:hidden flex flex-col gap-4 mt-2">
            {/* Boxed Quantity Selector */}
            <div
              className="flex items-center border w-fit h-[35px] px-[5px] py-[1px]"
              style={{ borderColor: "#BBA496" }}
            >
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="w-8 h-full flex items-center justify-center text-[#3E5460] disabled:opacity-50"
              >
                −
              </button>
              <span className="w-8 h-full flex items-center justify-center text-[#3E5460] font-medium text-[14px]">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="w-8 h-full flex items-center justify-center text-[#3E5460]"
              >
                +
              </button>
            </div>

            <p
              className="text-[14.5px] leading-[24px] font-normal text-[#3E5460]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Rs{" "}
              {totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Product Details Link */}
          <button
            className="text-[12px] md:text-[11.5px] lg:text-[12px] leading-[16px] md:leading-[15px] lg:leading-[16px] w-[83px] md:w-[79px] lg:w-[83px] text-center md:text-center mt-auto lg:mt-0 text-[#3E5460]"
            style={TEXT_STYLES.link}
          >
            Product details
          </button>
        </div>

        {/* Desktop Quantity (Hidden on Mobile) */}
        <div className="hidden lg:flex w-[60px] md:w-[65px] lg:w-[70px] pr-2 md:pr-3 lg:pr-[14.8px] justify-center">
          <div
            className={`flex items-center border min-h-[40px] md:min-h-[42px] lg:min-h-[44px] w-fit ${COMMON_CLASSES.cartItemBg}`}
            style={{ borderColor: "#BBA496" }}
          >
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className={`w-auto h-[40px] md:h-[42px] lg:h-[44px] px-1 md:px-1.5 lg:px-[5px] pt-[1px] pb-[1px] flex items-center justify-center ${COMMON_CLASSES.cartItemBg} hover:bg-[${COLORS.warmBeige}] disabled:opacity-50 disabled:cursor-not-allowed text-[13px] md:text-[13.5px] lg:text-[14px]`}
              style={{ ...TEXT_STYLES.bodyGraphite }}
            >
              −
            </button>
            <span
              className="w-auto h-[40px] md:h-[42px] lg:h-[44px] px-1 md:px-1.5 lg:px-[5px] pt-[1px] pb-[1px] flex items-center justify-center text-[13px] md:text-[13.5px] lg:text-[14px] font-medium"
              style={TEXT_STYLES.bodyGraphite}
            >
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className={`w-auto h-[40px] md:h-[42px] lg:h-[44px] px-1 md:px-1.5 lg:px-[5px] pt-[1px] pb-[1px] flex items-center justify-center ${COMMON_CLASSES.cartItemBg} hover:bg-[${COLORS.warmBeige}] text-[13px] md:text-[13.5px] lg:text-[14px]`}
              style={TEXT_STYLES.bodyGraphite}
            >
              +
            </button>
          </div>
        </div>

        {/* Desktop Price (Hidden on Mobile) */}
        <div className="hidden lg:flex w-[90px] md:w-[100px] lg:w-[112px] items-center justify-end gap-3 md:gap-4 lg:gap-[16px]">
          <p
            className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px] w-[70px] md:w-[78px] lg:w-[86px] h-[20px] md:h-[22px] lg:h-[24px] whitespace-nowrap"
            style={TEXT_STYLES.bodyGraphite}
          >
            Rs {totalPrice.toFixed(2)}
          </p>
          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            style={{ color: COLORS.richUmber }}
            title="Remove item"
          >
            <Trash2
              className="w-[12px] md:w-[12.7px] lg:w-[13.3px] h-[12px] md:h-[12.7px] lg:h-[13.3px]"
              strokeWidth={1}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
