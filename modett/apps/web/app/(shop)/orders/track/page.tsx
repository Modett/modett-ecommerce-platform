"use client";

import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import { trackOrder, type OrderDetails } from "@/lib/order-api";
import { OrderTrackingResult } from "./OrderTrackingResult";
import {
  COLORS,
  FONTS,
  TEXT_STYLES,
  COMMON_CLASSES,
  RESPONSIVE,
} from "@/features/cart/constants/styles";

// ============================================================================
// Styles
// ============================================================================

const STYLES = {
  page: `min-h-screen ${COMMON_CLASSES.pageBg}`,
  container: `w-full max-w-[1280px] mx-auto ${RESPONSIVE.padding.page} py-12 md:py-16`,
  input:
    "w-full h-[48px] px-4 border bg-white/50 text-[14px] transition-colors focus:outline-none focus:ring-1 focus:ring-[#232D35]",
  button: `h-[48px] px-8 text-[14px] font-medium tracking-[2px] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${COMMON_CLASSES.primaryButton}`,
  divider: "text-[14px] text-[#6B7280]",
  section: `border ${COMMON_CLASSES.borderPrimary} p-6 md:p-8 bg-white/50`,
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
          toast.error(
            response.message ||
              "Order not found. Please check your details and try again."
          );
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
          toast.error(
            response.message ||
              "Tracking number not found. This feature may not be fully implemented yet."
          );
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
          className="text-[32px] md:text-[36px] leading-[120%] mb-8 md:mb-12 text-center md:text-left"
          style={TEXT_STYLES.pageTitle}
        >
          Track Your Order
        </h1>

        {/* Tracking Forms Container */}
        <div className={STYLES.section}>
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-0">
            {/* Left Side: Order Number + Email/Phone */}
            <div className="flex-1 lg:pr-12">
              <h2
                className="text-[18px] mb-6 uppercase tracking-[1px]"
                style={TEXT_STYLES.bodyGraphite}
              >
                By Order Number
              </h2>
              <form onSubmit={handleOrderTrack} className="space-y-6">
                {/* Order Number Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="orderNumber"
                    className="block text-xs uppercase tracking-[1px]"
                    style={TEXT_STYLES.label}
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
                    style={{
                      fontFamily: FONTS.raleway,
                      borderColor: COLORS.warmBeige,
                      color: COLORS.graphite,
                    }}
                    disabled={isLoadingOrder}
                  />
                </div>

                {/* Email or Phone Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="emailOrPhone"
                    className="block text-xs uppercase tracking-[1px]"
                    style={TEXT_STYLES.label}
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
                    style={{
                      fontFamily: FONTS.raleway,
                      borderColor: COLORS.warmBeige,
                      color: COLORS.graphite,
                    }}
                    disabled={isLoadingOrder}
                  />
                </div>

                {/* Track Button */}
                <button
                  type="submit"
                  disabled={isLoadingOrder}
                  className={STYLES.button}
                  style={TEXT_STYLES.button}
                >
                  {isLoadingOrder ? "TRACKING..." : "TRACK ORDER"}
                </button>
              </form>
            </div>

            {/* Divider */}
            <div className="hidden lg:flex flex-col items-center justify-center px-8 pt-12">
              <div
                className="w-px h-[180px] border-l border-dashed"
                style={{ borderColor: COLORS.sand }}
              />
              <span
                className="my-4 text-xs uppercase tracking-widest bg-[#EFECE5] px-2 py-1 rounded-full"
                style={{ ...TEXT_STYLES.label, color: COLORS.slateGray }}
              >
                OR
              </span>
              <div
                className="w-px h-[180px] border-l border-dashed"
                style={{ borderColor: COLORS.sand }}
              />
            </div>

            {/* Mobile Divider */}
            <div className="lg:hidden flex items-center gap-4 py-4">
              <div
                className="flex-1 border-t border-dashed"
                style={{ borderColor: COLORS.sand }}
              />
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: COLORS.slateGray }}
              >
                OR
              </span>
              <div
                className="flex-1 border-t border-dashed"
                style={{ borderColor: COLORS.sand }}
              />
            </div>

            {/* Right Side: Tracking Number */}
            <div className="flex-1 lg:pl-12">
              <h2
                className="text-[18px] mb-6 uppercase tracking-[1px]"
                style={TEXT_STYLES.bodyGraphite}
              >
                By Tracking Number
              </h2>
              <form onSubmit={handleTrackingTrack} className="space-y-6">
                {/* Tracking Number Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="trackingNumber"
                    className="block text-xs uppercase tracking-[1px]"
                    style={TEXT_STYLES.label}
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
                    style={{
                      fontFamily: FONTS.raleway,
                      borderColor: COLORS.warmBeige,
                      color: COLORS.graphite,
                    }}
                    disabled={isLoadingTracking}
                  />
                </div>

                {/* Spacer to align with left side */}
                <div className="hidden lg:block h-[76px]" />

                {/* Track Button */}
                <button
                  type="submit"
                  disabled={isLoadingTracking}
                  className={STYLES.button}
                  style={TEXT_STYLES.button}
                >
                  {isLoadingTracking ? "TRACKING..." : "TRACK SHIPMENT"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p
            className="text-[14px]"
            style={{ ...TEXT_STYLES.bodySlate, fontFamily: FONTS.raleway }}
          >
            Can't find your order?{" "}
            <a
              href="/contact"
              className="underline hover:no-underline transition-all"
              style={{ color: COLORS.graphite }}
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
