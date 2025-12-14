"use client";

import { useState } from "react";
import { Cart } from "@/features/cart/types";
import { CartSummary } from "./cart-summary";

interface MobileOrderSummaryProps {
  cart: Cart | undefined;
}

export const MobileOrderSummary = ({ cart }: MobileOrderSummaryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = cart?.items || [];

  return (
    <div className="lg:hidden w-full border-t border-b border-[#E5E0D6] bg-[#EFECE5]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center relative px-4 pb-4 pt-3"
      >
        <span
          className="text-[14px] leading-[24px] font-medium text-[#3E5460]"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          Your cart ({cartItems.length} items)
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`absolute right-4 text-[#3E5460] transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-[#E5E0D6]">
          <CartSummary cart={cart} hideTitle />
        </div>
      )}
    </div>
  );
};
