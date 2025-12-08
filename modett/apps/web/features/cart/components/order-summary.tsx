"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Package, Undo2 } from "lucide-react";
import {
  TEXT_STYLES,
  COMMON_CLASSES,
  SPACING,
  COLORS,
  DIMENSIONS,
} from "@/features/cart/constants/styles";

interface OrderSummaryProps {
  subtotal: number;
  discount?: number;
  total: number;
}

export function OrderSummary({
  subtotal,
  discount = 0,
  total,
}: OrderSummaryProps) {
  const [discountCode, setDiscountCode] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleApplyDiscount = () => {
    // TODO: Implement discount code logic
    console.log("Applying discount code:", discountCode);
  };

  return (
    <div
      className={`w-full lg:w-[${DIMENSIONS.orderSummary.width}] lg:h-[${DIMENSIONS.orderSummary.height}] ${COMMON_CLASSES.orderSummaryBg} px-[24px] pb-[24px]`}
    >
      {/* Subtotal */}
      <div
        className={`flex items-start justify-between w-full h-auto pt-[6px] pb-[9px] border-t lg:border-t-0 border-b border-[#E5E0D6] lg:h-[56px] lg:pt-[14px] lg:pb-[8px] lg:border-b-[#D4C4A8]`}
      >
        <div className="flex items-center justify-between w-full">
          <span
            className="text-[20px] leading-[28px] font-normal"
            style={TEXT_STYLES.bodyGraphite}
          >
            Subtotal
          </span>
          <span
            className="text-[16px] leading-[24px] font-normal"
            style={TEXT_STYLES.bodyGraphite}
          >
            Rs {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Shipping */}
      <div className="mt-[10px] mb-[10px]">
        <div className={`flex flex-col gap-[6px] lg:gap-[4px] pb-[4px]`}>
          <div className="flex items-center justify-between">
            <span
              className="text-[14px] leading-[20px] font-normal"
              style={TEXT_STYLES.bodyGraphite}
            >
              Shipping Times and Costs
            </span>
            <span
              className="text-[14px] leading-[20px] font-normal"
              style={TEXT_STYLES.bodyGraphite}
            >
              free
            </span>
          </div>
          <p
            className="text-[10px] leading-[16px] font-normal"
            style={TEXT_STYLES.bodyGraphite}
          >
            2 to 3 working days after receipt of order confirmation
          </p>
        </div>
      </div>

      {/* Discount Code */}
      <div
        className={`w-full h-auto pt-[8px] mb-0 lg:mb-[24px] border-b border-[#E5E0D6] lg:border-none pb-[17.63px] lg:pb-0 flex flex-col gap-[16px] lg:gap-[16px]`}
      >
        <div className="w-full">
          <label
            className={`w-full h-auto text-[14px] leading-[20px] font-normal block pb-[4px] mb-[8px]`}
            style={TEXT_STYLES.label}
          >
            Discount Code
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Enter your Discount code here"
              className={`flex-1 h-[40px] pl-[12px] pr-[16px] border ${COMMON_CLASSES.borderPrimary} ${COMMON_CLASSES.orderSummaryBg} ${COMMON_CLASSES.bodySmall} placeholder:text-[#3E5460]`}
              style={{ ...TEXT_STYLES.button, color: COLORS.tealBlue }}
            />
            <Button
              onClick={handleApplyDiscount}
              className={`h-[40px] w-auto px-4 lg:w-[80px] lg:px-0 bg-transparent border border-[#765C4D] lg:border-[#D4C4A8] hover:bg-[#E5E0D6] rounded-none text-[14px] font-normal lg:font-medium uppercase tracking-[4px] lg:tracking-[2px] shadow-none text-[#765C4D] lg:text-[#232D35]`}
              style={{ ...TEXT_STYLES.button }}
            >
              APPLY
            </Button>
          </div>
        </div>
        <p
          className="text-[11px] leading-[16px] font-normal mt-0 text-[#3E5460]"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          This site is protected by reCAPTCHA and the Google Privacy Policy and
          Terms of Service apply.
        </p>
      </div>

      {/* Total */}
      <div
        className={`flex items-center justify-between pt-[16px] lg:pt-[24px] border-t-0 lg:border-t ${COMMON_CLASSES.borderPrimary} mb-[16px]`}
      >
        <div className="flex items-center gap-1">
          <span
            className="w-auto lg:w-[42.45px] h-[28px] flex items-center font-normal text-[20px] lg:text-[16px] leading-[140%] tracking-[0%]"
            style={TEXT_STYLES.bodyGraphite}
          >
            total
          </span>
          <span
            className="text-[12px] leading-[24px] font-normal"
            style={TEXT_STYLES.bodySlate}
          >
            (Taxes inc.)
          </span>
        </div>
        <span
          className="text-[18px] leading-[28px] font-bold"
          style={TEXT_STYLES.bodyGraphite}
        >
          Rs {total.toFixed(2)}
        </span>
      </div>

      {/* Proceed Button */}
      <Button
        className={`w-full h-[${DIMENSIONS.button.proceedHeight}] ${COMMON_CLASSES.primaryButton} rounded-none text-[14px] font-medium mb-[32px] tracking-[2px]`}
        style={TEXT_STYLES.button}
      >
        PROCEED
      </Button>

      {/* Payment Options */}
      <div
        className={`w-full h-auto border-b ${COMMON_CLASSES.borderPrimary} pb-[17px] mb-[24px]`}
      >
        <p
          className={`${COMMON_CLASSES.bodySmall} font-medium uppercase mb-[12px]`}
          style={TEXT_STYLES.bodyGraphite}
        >
          PAYMENT OPTIONS
        </p>
        <div className={`flex items-center gap-[8px] flex-wrap`}>
          {/* Payment icons placeholder - replace with actual icons */}
          {["AMEX", "VISA", "MC", "DISC", "JCB", "PP"].map((payment) => (
            <div
              key={payment}
              className={`w-[40px] h-[26px] bg-white border border-[#E5E0D6] rounded-[2px] flex items-center justify-center text-[8px] text-[#232D35]`}
            >
              {payment}
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Info */}
      <div className="flex gap-[12px] mb-[16px]">
        <Package className="w-[24px] h-[25px] text-[#232D35] stroke-[1.5px]" />
        <p
          className="text-[12px] leading-[18px] font-normal text-[#6B7B8A]"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          We offer free shipping on all orders with Express Worldwide service.
        </p>
      </div>

      {/* Return Policy */}
      <div className="flex gap-[12px] mb-[24px]">
        <Undo2 className="w-[60px] h-[60px] text-[#232D35] stroke-[2px]" />
        <p
          className="text-[12px] leading-[18px] font-normal text-[#6B7B8A]"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          We guarantee 30 days to return or exchange, starting from the delivery
          date of the order. For fragrance returns, we invite you to consult the{" "}
          <a
            href="/frequently-asked-questions"
            className="underline decoration-[#6B7B8A] underline-offset-2"
          >
            Frequently Asked Questions
          </a>{" "}
          section.
        </p>
      </div>

      {/* May We Help You */}
      <div
        className={`w-full h-[68px] flex items-center border-y border-[#E5E0D6] lg:border-t lg:h-auto lg:pt-[16px] lg:block lg:border-b-0`}
      >
        <button
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          className="w-full flex items-center justify-between group"
        >
          <span
            className="text-[16px] leading-[20px] font-medium uppercase tracking-[2px] text-[#3E5460]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            MAY WE HELP YOU?
          </span>
          <ChevronDown
            className={`w-5 h-5 text-[#3E5460] transition-transform duration-300 ${isHelpOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isHelpOpen && (
          <div className="mt-[16px]">
            <p
              className="text-[12px] leading-[18px] font-normal text-[#6B7B8A]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              If you need assistance, please contact our customer service team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
