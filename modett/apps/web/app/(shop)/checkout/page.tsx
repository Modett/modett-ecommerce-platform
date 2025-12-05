"use client";

import { useState, useEffect } from "react";
import {
  TEXT_STYLES,
  COMMON_CLASSES,
  RESPONSIVE,
} from "@/features/cart/constants/styles";
import { useCart } from "@/features/cart/queries";
import { getStoredCartId } from "@/features/cart/utils";
import { CheckoutProgressBar } from "@/features/checkout/components/checkout-progress-bar";
import { CartSummary } from "@/features/checkout/components/cart-summary";
import { CheckoutHelpSection } from "@/features/checkout/components/checkout-help-section";
import { useRouter } from "next/navigation";

export default function CheckoutEmailPage() {
  const [email, setEmail] = useState("");
  const [cartId, setCartId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedCartId = getStoredCartId();
    if (storedCartId) {
      setCartId(storedCartId);
    }
  }, []);

  const { data: cart, isLoading } = useCart(cartId);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Validate email and navigate to shipping page
    console.log("Email:", email);
    router.push("/checkout/shipping");
  };

  if (isLoading) {
    return (
      <main
        className={`w-full min-h-screen ${COMMON_CLASSES.pageBg} flex items-center justify-center`}
      >
        <div className="animate-pulse text-lg">Loading...</div>
      </main>
    );
  }

  return (
    <main className={`w-full min-h-screen ${COMMON_CLASSES.pageBg}`}>
      <div
        className={`w-full max-w-[1440px] mx-auto ${RESPONSIVE.padding.page} py-8`}
      >
        <CheckoutProgressBar currentStep={1} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 min-h-[750px]">
          <div className="space-y-2">
            <div className={`${COMMON_CLASSES.pageBg} w-full max-w-[904px]`}>
              {/* Active Step Header */}
              <div className="bg-[#232D35] p-[16px] flex items-center h-[60px]">
                <h1
                  className="text-[20px] leading-[140%] font-normal tracking-[0%] text-[#EFECE5]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  1. E-mail address
                </h1>
              </div>

              <div className="p-6">
                <p
                  className="text-base font-medium leading-[20px] tracking-[0.02em] mb-6"
                  style={TEXT_STYLES.bodyTeal}
                >
                  Enter your e-mail address to proceed to checkout. If you are
                  already registered, you will be asked to enter your password.
                </p>

                <form onSubmit={handleContinue}>
                  <div className="mb-6">
                    <label
                      htmlFor="email"
                      className="block text-xs mb-2"
                      style={TEXT_STYLES.bodyGraphite}
                    >
                      E-mail address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full h-[42px] px-4 border border-[#BBA496] bg-[#F4F1EB] focus:outline-none focus:border-gray-400"
                      style={TEXT_STYLES.bodyGraphite}
                    />
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="w-[300px] h-[50px] bg-[#232D35] border border-[#232D35] flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <span
                        className="text-sm font-medium text-white uppercase tracking-[3px]"
                        style={{ fontFamily: "Reddit Sans, sans-serif" }}
                      >
                        CONTINUE
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Future Steps */}
            <div className="bg-[#E5E0D6] border border-[#E5E0D6] h-[60px] flex items-center px-6">
              <h2
                className="text-[17.7px] leading-[28px] font-normal text-[#BBA496]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                2. Shipping
              </h2>
            </div>

            <div className="bg-[#E5E0D6] border border-[#E5E0D6] h-[60px] flex items-center px-6">
              <h2
                className="text-[17.7px] leading-[28px] font-normal text-[#BBA496]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                3. Information
              </h2>
            </div>

            <div className="bg-[#E5E0D6] border border-[#E5E0D6] h-[60px] flex items-center px-6">
              <h2
                className="text-[17.7px] leading-[28px] font-normal text-[#BBA496]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                4. Payment
              </h2>
            </div>

            <CheckoutHelpSection />
          </div>

          <div className="mt-[-80px]">
            <CartSummary cart={cart} />
          </div>
        </div>
      </div>
    </main>
  );
}
