"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { TEXT_STYLES, COMMON_CLASSES, SPACING, COLORS, RESPONSIVE } from "@/features/cart/constants/styles";

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
    <div className={`w-full ${COMMON_CLASSES.borderLight} py-3 md:py-4 lg:py-[16px] ${COMMON_CLASSES.cartItemBg}`}>
      <div className={`flex px-3 md:px-4 lg:px-[16px] items-center ${RESPONSIVE.gap.item}`}>
        <div className="w-[120px] md:w-[135px] lg:w-[149.61px]">
          <Link href={`/product/${slug}`} className="block w-fit">
            <div className="relative w-[120px] md:w-[135px] lg:w-[149.61px] h-[153px] md:h-[172px] lg:h-[190.88px] bg-gray-100 overflow-hidden">
              <Image src={image} alt={title} fill className="object-cover" />
            </div>
          </Link>
        </div>

        <div className="flex-1 md:w-[280px] lg:w-[342.02px] flex flex-col gap-5 md:gap-6 lg:gap-[29px] h-[153px] md:h-[172px] lg:h-[190.88px] pl-3 md:pl-4 lg:pl-[20px]">
          <div className={`flex flex-col ${SPACING.tinyGap}`}>
            <span
              className="text-[9px] md:text-[9.5px] lg:text-[10px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[1.5px] md:tracking-[1.7px] lg:tracking-[2px] uppercase"
              style={TEXT_STYLES.sku}
            >
              SKU: {productId.substring(0, 12)}...
            </span>
            <Link href={`/product/${slug}`}>
              <h3
                className="text-[16px] md:text-[17px] lg:text-[18px] leading-[22px] md:leading-[24px] lg:leading-[26px] font-normal hover:underline"
                style={TEXT_STYLES.productTitle}
              >
                {title}
              </h3>
            </Link>
          </div>

          <div className={`flex flex-col ${SPACING.tinyGap}`}>
            {color && (
              <p
                className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px] uppercase"
                style={TEXT_STYLES.bodyTeal}
              >
                COLOUR: <span style={{ color: COLORS.tealBlue }}>{color}</span>
              </p>
            )}
            {size && (
              <p
                className="text-[12px] md:text-[13px] lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal tracking-[0.8px] md:tracking-[0.9px] lg:tracking-[1.03px]"
                style={TEXT_STYLES.bodyTeal}
              >
                Size: {size}
              </p>
            )}
          </div>

          <button
            className="text-[11px] md:text-[11.5px] lg:text-[12px] leading-[14px] md:leading-[15px] lg:leading-[16px] w-[75px] md:w-[79px] lg:w-[83px] h-[14px] md:h-[15px] lg:h-[16px] text-center"
            style={TEXT_STYLES.link}
          >
            Product details
          </button>
        </div>

        {/* Quantity */}
        <div className="w-[60px] md:w-[65px] lg:w-[70px] pr-2 md:pr-3 lg:pr-[14.8px]">
          <div className={`flex items-center ${COMMON_CLASSES.borderSecondary} min-h-[40px] md:min-h-[42px] lg:min-h-[44px] w-fit ${COMMON_CLASSES.cartItemBg} -ml-[25px] md:-ml-[28px] lg:-ml-[30px]`}>
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

        {/* Price */}
        <div className="w-[90px] md:w-[100px] lg:w-[112px] flex items-center justify-end gap-3 md:gap-4 lg:gap-[16px]">
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
            <Trash2 className="w-[12px] md:w-[12.7px] lg:w-[13.3px] h-[12px] md:h-[12.7px] lg:h-[13.3px]" strokeWidth={1} />
          </button>
        </div>
      </div>
    </div>
  );
}
