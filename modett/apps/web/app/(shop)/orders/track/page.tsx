"use client";

import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import { trackOrder, type OrderDetails } from "@/lib/order-api";
import { OrderTrackingResult } from "./OrderTrackingResult";

// ============================================================================
// Types
// ============================================================================

// ============================================================================
// Styles
// ============================================================================

const STYLES = {
  page: "min-h-screen bg-[#EFECE5]",
  container: "w-full max-w-[1280px] mx-auto px-4 md:px-[80px] py-12 md:py-16",
  title: {
    fontFamily: "Raleway, sans-serif",
    fontWeight: 400,
    color: "#232D35",
  },
  label: {
    fontFamily: "Raleway, sans-serif",
    fontWeight: 400,
    color: "#232D35",
    fontSize: "14px",
  },
  input:
    "w-full h-[48px] px-4 border border-[#232D35] bg-white text-[14px] text-[#232D35] placeholder:text-[#A09B93] focus:outline-none focus:border-[#232D35] focus:ring-1 focus:ring-[#232D35] transition-colors",
  button:
    "h-[48px] px-8 bg-[#232D35] text-white text-[14px] font-medium tracking-[2px] uppercase hover:bg-[#1a2228] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  divider: "text-[14px] text-[#6B7280]",
  section: "border border-[#E5E0D6] p-6 md:p-8 bg-white/50",
};

// ============================================================================
// Main Component
// ============================================================================

export default function OrderTrackingPage() {
  // State for Order Number tracking
  const [orderNumber, setOrderNumber] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  // State for Tracking Number
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);

  // State for tracking result
  const [trackingResult, setTrackingResult] = useState<OrderDetails | null>(
    null
  );

  // Handle Order Number tracking
  const handleOrderTrack = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!orderNumber.trim()) {
        toast.error("Please enter your order number");
        return;
      }

      if (!emailOrPhone.trim()) {
        toast.error("Please enter your email or phone number");
        return;
      }

      setIsLoadingOrder(true);
      setTrackingResult(null); // Clear previous results

      try {
        const response = await trackOrder({
          orderNumber: orderNumber.trim(),
          contact: emailOrPhone.trim(),
        });

        if (response.success && response.data) {
          toast.success("Order found!");
          setTrackingResult(response.data);
        } else {
          toast.error(response.message || "Order not found. Please check your details and try again.");
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoadingOrder(false);
      }
    },
    [orderNumber, emailOrPhone]
  );

  // Handle Tracking Number lookup
  const handleTrackingTrack = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!trackingNumber.trim()) {
        toast.error("Please enter your tracking number");
        return;
      }

      setIsLoadingTracking(true);
      setTrackingResult(null); // Clear previous results

      try {
        const response = await trackOrder({
          trackingNumber: trackingNumber.trim(),
        });

        if (response.success && response.data) {
          toast.success("Order found!");
          setTrackingResult(response.data);
        } else {
          toast.error(response.message || "Tracking number not found. This feature may not be fully implemented yet.");
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoadingTracking(false);
      }
    },
    [trackingNumber]
  );

  return (
    <main className={STYLES.page}>
      <div className={STYLES.container}>
        {/* Page Title */}
        <h1
          className="text-[32px] md:text-[36px] leading-[120%] mb-8 md:mb-12"
          style={STYLES.title}
        >
          Track Your Order
        </h1>

        {/* Tracking Forms Container */}
        <div className={STYLES.section}>
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-0">
            {/* Left Side: Order Number + Email/Phone */}
            <div className="flex-1 lg:pr-12">
              <form onSubmit={handleOrderTrack} className="space-y-6">
                {/* Order Number Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="orderNumber"
                    className="block"
                    style={STYLES.label}
                  >
                    Order Number
                  </label>
                  <input
                    id="orderNumber"
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g., ORD-2024-001234"
                    className={STYLES.input}
                    style={{ fontFamily: "Raleway, sans-serif" }}
                    disabled={isLoadingOrder}
                  />
                </div>

                {/* Email or Phone Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="emailOrPhone"
                    className="block"
                    style={STYLES.label}
                  >
                    Email or Phone Number
                  </label>
                  <input
                    id="emailOrPhone"
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Enter your email or phone"
                    className={STYLES.input}
                    style={{ fontFamily: "Raleway, sans-serif" }}
                    disabled={isLoadingOrder}
                  />
                </div>

                {/* Track Button */}
                <button
                  type="submit"
                  disabled={isLoadingOrder}
                  className={STYLES.button}
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {isLoadingOrder ? "TRACKING..." : "TRACK"}
                </button>
              </form>
            </div>

            {/* Divider */}
            <div className="hidden lg:flex flex-col items-center justify-center px-8">
              <div className="w-px h-[200px] border-l border-dashed border-[#D1D5DB]" />
              <span
                className="my-4"
                style={{ ...STYLES.label, color: "#6B7280" }}
              >
                Or
              </span>
              <div className="w-px h-[200px] border-l border-dashed border-[#D1D5DB]" />
            </div>

            {/* Mobile Divider */}
            <div className="lg:hidden flex items-center gap-4">
              <div className="flex-1 border-t border-dashed border-[#D1D5DB]" />
              <span style={{ ...STYLES.label, color: "#6B7280" }}>Or</span>
              <div className="flex-1 border-t border-dashed border-[#D1D5DB]" />
            </div>

            {/* Right Side: Tracking Number */}
            <div className="flex-1 lg:pl-12">
              <form onSubmit={handleTrackingTrack} className="space-y-6">
                {/* Tracking Number Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="trackingNumber"
                    className="block"
                    style={STYLES.label}
                  >
                    Tracking Number
                  </label>
                  <input
                    id="trackingNumber"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter shipping tracking number"
                    className={STYLES.input}
                    style={{ fontFamily: "Raleway, sans-serif" }}
                    disabled={isLoadingTracking}
                  />
                </div>

                {/* Spacer to align with left side */}
                <div className="h-[76px]" />

                {/* Track Button */}
                <button
                  type="submit"
                  disabled={isLoadingTracking}
                  className={STYLES.button}
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {isLoadingTracking ? "TRACKING..." : "TRACK"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p
            className="text-[14px] text-[#6B7280]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Can't find your order?{" "}
            <a
              href="/contact"
              className="text-[#232D35] underline hover:no-underline"
            >
              Contact our support team
            </a>
          </p>
        </div>

        {/* Tracking Results */}
        {trackingResult && <OrderTrackingResult order={trackingResult} />}
      </div>
    </main>
  );
}
