"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { TEXT_STYLES, COMMON_CLASSES, SPACING, COLORS, DIMENSIONS } from "@/features/cart/constants/styles";

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
    <div className={`w-full lg:w-[${DIMENSIONS.orderSummary.width}] lg:h-[${DIMENSIONS.orderSummary.height}] ${COMMON_CLASSES.orderSummaryBg} px-[24px] pb-[24px]`}>
      {/* Subtotal */}
      <div className={`h-[56px] flex items-start pt-[14px] pb-[8px] border-b ${COMMON_CLASSES.borderPrimary}`}>
        <div className="flex items-center justify-between w-full">
          <span
            className={COMMON_CLASSES.heading6}
            style={TEXT_STYLES.bodyGraphite}
          >
            Subtotal
          </span>
          <span
            className="text-[16px] leading-[24px] font-medium"
            style={TEXT_STYLES.bodyGraphite}
          >
            Rs {subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Shipping */}
      <div className="mt-[10px] mb-[10px]">
        <div className={`flex flex-col ${SPACING.tinyGap} pb-[4px]`}>
          <div className="flex items-center justify-between">
            <span
              className={COMMON_CLASSES.bodySmall}
              style={TEXT_STYLES.bodyGraphite}
            >
              Shipping Times and Costs
            </span>
            <span
              className="text-[14px] leading-[20px] font-medium"
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
      <div className="w-full h-auto pt-[8px] mb-[32px]">
        <label
          className={`w-full h-auto ${COMMON_CLASSES.bodyExtraSmall} font-medium block pb-[4px] mb-[8px]`}
          style={TEXT_STYLES.label}
        >
          Discount Code
        </label>
        <div className="flex">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Enter your Discount code here"
            className={`w-[${DIMENSIONS.input.discountWidth}] h-[${DIMENSIONS.input.height}] pl-[12px] pr-[16px] border ${COMMON_CLASSES.borderPrimary} ${COMMON_CLASSES.orderSummaryBg} ${COMMON_CLASSES.bodySmall}`}
            style={{ ...TEXT_STYLES.button, color: COLORS.tealBlue }}
          />
          <Button
            onClick={handleApplyDiscount}
            className={`w-[${DIMENSIONS.button.applyWidth}] h-[${DIMENSIONS.button.applyHeight}] ${COMMON_CLASSES.secondaryButton} text-[14px] font-medium uppercase tracking-[2px] shadow-none`}
            style={{ ...TEXT_STYLES.button, color: COLORS.graphite }}
          >
            APPLY
          </Button>
        </div>
        <p
          className="text-[11px] leading-[16px] font-normal mt-[8px]"
          style={TEXT_STYLES.bodyGraphite}
        >
          This site is protected by reCAPTCHA and the Google Privacy Policy and
          Terms of Service apply.
        </p>
      </div>

      {/* Total */}
      <div className={`flex items-center justify-between pt-[24px] border-t ${COMMON_CLASSES.borderPrimary} mb-[16px]`}>
        <span
          className="text-[16px] leading-[24px] font-medium"
          style={TEXT_STYLES.bodySlate}
        >
          total
          <span className="text-[12px]"> (Taxes inc.)</span>
        </span>
        <span
          className="text-[18px] leading-[28px] font-bold"
          style={TEXT_STYLES.bodyGraphite}
        >
          Rs {total.toFixed(2)}
        </span>
      </div>

      {/* Proceed Button */}
      <Button
        className={`w-full h-[${DIMENSIONS.button.proceedHeight}] ${COMMON_CLASSES.primaryButton} rounded-none text-[14px] font-medium mb-[32px]`}
        style={TEXT_STYLES.button}
      >
        PROCEED
      </Button>

      {/* Payment Options */}
      <div className={`w-full h-auto border-b ${COMMON_CLASSES.borderPrimary} pb-[17px] mb-[24px]`}>
        <p
          className={`${COMMON_CLASSES.bodySmall} font-medium uppercase mb-[12px]`}
          style={TEXT_STYLES.bodyGraphite}
        >
          PAYMENT OPTIONS
        </p>
        <div className={`flex items-center ${SPACING.smallGap} flex-wrap`}>
          {/* Payment icons placeholder - replace with actual icons */}
          {["AMEX", "VISA", "MC", "DISC", "JCB", "PP"].map((payment) => (
            <div
              key={payment}
              className={`w-[${DIMENSIONS.paymentIcon.width}] h-[${DIMENSIONS.paymentIcon.height}] ${COMMON_CLASSES.orderSummaryBg} border border-gray-300 rounded flex items-center justify-center text-[8px]`}
            >
              {payment}
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Info */}
      <div className="flex gap-[12px] mb-[16px]">
        <span className="text-[16px]">📦</span>
        <p
          className={COMMON_CLASSES.bodySmall}
          style={TEXT_STYLES.bodySlate}
        >
          We offer free shipping on all orders with Express Worldwide service.
        </p>
      </div>

      {/* Return Policy */}
      <div className="flex gap-[12px] mb-[24px]">
        <span className="text-[16px]">↩️</span>
        <p
          className={COMMON_CLASSES.bodySmall}
          style={TEXT_STYLES.bodySlate}
        >
          We guarantee 30 days to return or exchange, starting from the delivery
          date of the order. For fragrance returns, we invite you to consult the{" "}
          <a href="/frequently-asked-questions" className="underline">
            Frequently Asked Questions
          </a>{" "}
          section.
        </p>
      </div>

      {/* May We Help You */}
      <div className={`border-t ${COMMON_CLASSES.borderPrimary} pt-[16px]`}>
        <button
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          className="w-full flex items-center justify-between"
        >
          <span
            className="text-[16px] leading-[20px] font-medium uppercase tracking-[2px]"
            style={TEXT_STYLES.bodyTeal}
          >
            MAY WE HELP YOU?
          </span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isHelpOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isHelpOpen && (
          <div className="mt-[16px]">
            <p
              className={COMMON_CLASSES.bodySmall}
              style={TEXT_STYLES.bodySlate}
            >
              If you need assistance, please contact our customer service team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
