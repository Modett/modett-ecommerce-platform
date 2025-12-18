"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { TEXT_STYLES, COMMON_CLASSES } from "@/features/cart/constants/styles";
import { useCart } from "@/features/cart/queries";
import { getStoredCartId, clearCartId } from "@/features/cart/utils";
import { LoadingState } from "@/features/checkout/components/loading-state";
import * as cartApi from "@/features/cart/api";
import { Check, X } from "lucide-react";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  // Extract checkoutId and ensure it doesn't contain query parameters
  const rawCheckoutId = searchParams?.get("checkoutId");
  const checkoutId = rawCheckoutId?.split("?")[0] || rawCheckoutId;
  const rawIntentId = searchParams?.get("intentId");
  const intentId = rawIntentId?.split("?")[0] || rawIntentId;
  const [cartId, setCartId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);

  const { data: cart } = useCart(cartId);

  useEffect(() => {
    const storedCartId = getStoredCartId();
    if (storedCartId) {
      setCartId(storedCartId);
    }
  }, []);

  useEffect(() => {
    // Skip if already processed
    if (hasProcessed) return;

    if (!checkoutId) {
      setError("No checkout ID provided");
      setStatus("error");
      return;
    }

    if (!cart) {
      return; // Wait for cart data
    }

    // Mark as processed to prevent re-execution
    setHasProcessed(true);

    // Complete the checkout and create order
    const completeOrder = async () => {
      try {
        setStatus("loading");

        // Build shipping address from cart data
        const shippingAddress = {
          firstName: cart.shippingFirstName || "",
          lastName: cart.shippingLastName || "",
          addressLine1: cart.shippingAddress1 || "",
          addressLine2: cart.shippingAddress2,
          city: cart.shippingCity || "",
          state: cart.shippingProvince,
          postalCode: cart.shippingPostalCode,
          country: cart.shippingCountryCode || "LK",
          phone: cart.shippingPhone,
        };

        // Build billing address (use shipping if same address)
        const billingAddress = cart.sameAddressForBilling
          ? shippingAddress
          : {
              firstName: cart.billingFirstName || "",
              lastName: cart.billingLastName || "",
              addressLine1: cart.billingAddress1 || "",
              addressLine2: cart.billingAddress2,
              city: cart.billingCity || "",
              state: cart.billingProvince,
              postalCode: cart.billingPostalCode,
              country: cart.billingCountryCode || "LK",
              phone: cart.billingPhone,
            };

        // Complete checkout with order creation
        // Use the actual intentId from payment creation
        const result = await cartApi.completeCheckoutWithOrder(
          checkoutId,
          intentId || checkoutId, // Use intentId from URL, fallback to checkoutId
          shippingAddress,
          billingAddress
        );

        setOrderId(result.order?.id || checkoutId);
        setStatus("success");

        // Clear cart ID from localStorage using utility function
        clearCartId();
        setCartId(null);

        // Clear all React Query cache to ensure fresh data on next page load
        queryClient.clear();
      } catch (err: any) {
        const errorMessage = err.message || "Failed to complete order";
        setError(errorMessage);
        setStatus("error");

        // If checkout expired, redirect back to payment page
        if (errorMessage.includes("expired")) {
          setTimeout(() => {
            router.push("/checkout/payment");
          }, 3000);
        }
      }
    };

    completeOrder();
  }, [checkoutId, cart, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingState />
        <p className="mt-4 text-[#3E5460]" style={TEXT_STYLES.bodyTeal}>
          Completing your order...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <main className={`w-full min-h-screen ${COMMON_CLASSES.pageBg}`}>
        <div className="w-full max-w-[600px] mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-12 h-12 text-red-600" />
            </div>
            <h1
              className="text-2xl font-semibold text-[#232D35] mb-4"
              style={TEXT_STYLES.bodyGraphite}
            >
              Order Failed
            </h1>
            <p className="text-[#3E5460] mb-8" style={TEXT_STYLES.bodyTeal}>
              {error || "Something went wrong while processing your order."}
            </p>
            <button
              onClick={() => router.push("/checkout/payment")}
              className="bg-[#232D35] text-[#E5E0D6] px-8 py-3 hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`w-full min-h-screen ${COMMON_CLASSES.pageBg}`}>
      <div className="w-full max-w-[600px] mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h1
            className="text-2xl md:text-3xl font-semibold text-[#232D35] mb-4"
            style={TEXT_STYLES.bodyGraphite}
          >
            Order Confirmed!
          </h1>
          <p className="text-[#3E5460] mb-2" style={TEXT_STYLES.bodyTeal}>
            Thank you for your purchase.
          </p>
          <p className="text-[#3E5460] mb-8" style={TEXT_STYLES.bodyTeal}>
            Order ID: <span className="font-semibold">{orderId}</span>
          </p>

          <div className="border-t border-[#E5E0D6] pt-6 mb-6">
            <p
              className="text-sm text-[#3E5460] mb-4"
              style={TEXT_STYLES.bodyTeal}
            >
              A confirmation email has been sent to{" "}
              <span className="font-semibold">{cart?.email}</span>
            </p>
            <p className="text-sm text-[#3E5460]" style={TEXT_STYLES.bodyTeal}>
              Your order will be processed and shipped according to the selected
              shipping method.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/shop")}
              className="bg-[#232D35] text-[#E5E0D6] px-8 py-3 hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => router.push("/orders")}
              className="border border-[#232D35] text-[#232D35] px-8 py-3 hover:bg-[#232D35] hover:text-[#E5E0D6] transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
