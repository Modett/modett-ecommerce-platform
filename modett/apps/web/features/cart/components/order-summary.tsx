"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

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
    <div className="w-[300px] h-[716px] bg-[#F5F3EE] p-[32px]">
      {/* Subtotal */}
      <div className="mb-[24px]">
        <div className="flex items-center justify-between mb-[8px]">
          <span
            className="text-[14px] leading-[20px] font-normal"
            style={{ fontFamily: "Raleway, sans-serif", color: "#6B7B8A" }}
          >
            Subtotal
          </span>
          <span
            className="text-[16px] leading-[24px] font-medium"
            style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
          >
            Rs {subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Shipping */}
      <div className="mb-[24px]">
        <div className="flex items-center justify-between mb-[8px]">
          <span
            className="text-[14px] leading-[20px] font-normal"
            style={{ fontFamily: "Raleway, sans-serif", color: "#6B7B8A" }}
          >
            Shipping Times and Costs
          </span>
          <span
            className="text-[14px] leading-[20px] font-medium"
            style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
          >
            free
          </span>
        </div>
        <p
          className="text-[12px] leading-[18px] font-normal"
          style={{ fontFamily: "Raleway, sans-serif", color: "#6B7B8A" }}
        >
          2 to 3 working days after receipt of order confirmation
        </p>
      </div>

      {/* Discount Code */}
      <div className="mb-[32px]">
        <label
          className="text-[14px] leading-[20px] font-medium block mb-[12px]"
          style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
        >
          Discount Code
        </label>
        <div className="flex gap-[8px]">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Enter your Discount code here"
            className="flex-1 h-[40px] px-[12px] border border-[#D4C4A8] bg-white text-[14px] placeholder:text-[#A0A0A0]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          />
          <Button
            onClick={handleApplyDiscount}
            className="w-[80px] h-[40px] bg-transparent border border-[#D4C4A8] text-[#232D35] hover:bg-[#E5E0D6] rounded-none text-[14px] font-medium uppercase tracking-[2px]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            APPLY
          </Button>
        </div>
        <p
          className="text-[11px] leading-[16px] font-normal mt-[8px]"
          style={{ fontFamily: "Raleway, sans-serif", color: "#6B7B8A" }}
        >
          This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
        </p>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-[24px] border-t border-[#D4C4A8] mb-[24px]">
        <span
          className="text-[16px] leading-[24px] font-medium"
          style={{ fontFamily: "Raleway, sans-serif", color: "#6B7B8A" }}
        >
          total
          <span className="text-[12px]"> (Taxes inc.)</span>
        </span>
        <span
          className="text-[18px] leading-[28px] font-bold"
          style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
        >
          Rs {total.toFixed(2)}
        </span>
      </div>

      {/* Proceed Button */}
      <Button
        className="w-full h-[50px] bg-[#3E5460] text-white hover:bg-[#2c3b44] rounded-none text-[14px] font-medium uppercase tracking-[3px] mb-[32px]"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        PROCEED
      </Button>

      {/* Payment Options */}
      <div className="mb-[24px]">
        <p
          className="text-[12px] leading-[18px] font-medium uppercase mb-[12px]"
          style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
        >
          PAYMENT OPTIONS
        </p>
        <div className="flex items-center gap-[8px] flex-wrap">
          {/* Payment icons placeholder - replace with actual icons */}
          <div className="w-[40px] h-[26px] bg-white border border-gray-300 rounded flex items-center justify-center text-[8px]">
            AMEX
          </div>
          <div className="w-[40px] h-[26px] bg-white border border-gray-300 rounded flex items-center justify-center text-[8px]">
            VISA
          </div>
          <div className="w-[40px] h-[26px] bg-white border border-gray-300 rounded flex items-center justify-center text-[8px]">
            MC
          </div>
          <div className="w-[40px] h-[26px] bg-white border border-gray-300 rounded flex items-center justify-center text-[8px]">
            DISC
          </div>
          <div className="w-[40px] h-[26px] bg-white border border-gray-300 rounded flex items-center justify-center text-[8px]">
            JCB
          </div>
          <div className="w-[40px] h-[26px] bg-white border border-gray-300 rounded flex items-center justify-center text-[8px]">
            PP
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="flex gap-[12px] mb-[16px]">
        <span className="text-[16px]">📦</span>
        <p
          className="text-[12px] leading-[18px] font-normal"
          style={{ fontFamily: "Raleway, sans-serif", color: "#6B7B8A" }}
        >
          We offer free shipping on all orders with Express Worldwide service.
        </p>
      </div>

      {/* Return Policy */}
      <div className="flex gap-[12px] mb-[24px]">
        <span className="text-[16px]">↩️</span>
        <p
          className="text-[12px] leading-[18px] font-normal"
          style={{ fontFamily: "Raleway, sans-serif", color: "#6B7B8A" }}
        >
          We guarantee 30 days to return or exchange, starting from the delivery date of the order. For fragrance returns, we invite you to consult the{" "}
          <a href="/frequently-asked-questions" className="underline">
            Frequently Asked Questions
          </a>{" "}
          section.
        </p>
      </div>

      {/* May We Help You */}
      <div className="border-t border-[#D4C4A8] pt-[16px]">
        <button
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          className="w-full flex items-center justify-between"
        >
          <span
            className="text-[14px] leading-[20px] font-medium uppercase tracking-[2px]"
            style={{ fontFamily: "Raleway, sans-serif", color: "#232D35" }}
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
              className="text-[12px] leading-[18px] font-normal"
              style={{ fontFamily: "Raleway, sans-serif", color: "#6B7B8A" }}
            >
              If you need assistance, please contact our customer service team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
