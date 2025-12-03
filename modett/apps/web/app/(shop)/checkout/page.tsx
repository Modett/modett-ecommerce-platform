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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-2">
            <div className={`${COMMON_CLASSES.pageBg} border border-[#E5E0D6]`}>
              {/* Active Step Header */}
              <div className="bg-[#232D35] px-6 pt-[26px] pb-[27px]">
                <h1
                  className="text-xl font-normal text-[#EFECE5]"
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

            <div className="mt-8 pt-[25px] grid grid-cols-1 md:grid-cols-[261px_1fr] gap-8">
              {/* Left Column: Shipping & Returns */}
              <div className="space-y-6 border-r border-[#E5E0D6] pr-[11px]">
                <div className="flex items-start gap-[6px]">
                  <div className="flex-shrink-0">
                    <svg
                      width="24"
                      height="25"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  <div>
                    <p
                      className="text-[12px] leading-[18px] text-[#3E5460]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      We offer free shipping on all orders with Express
                      Worldwide service.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-[6px]">
                  <div className="flex-shrink-0">
                    <svg
                      width="24"
                      height="25"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                      <path d="M2 12h20" />
                    </svg>
                  </div>
                  <div>
                    <p
                      className="text-[12px] leading-[18px] text-[#3E5460]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      We guarantee 30 days to return or exchange, starting from
                      the delivery date of the order. For fragrance returns, we
                      invite you to consult the{" "}
                      <a href="#" className="underline">
                        Frequently Asked Questions
                      </a>{" "}
                      section.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Help */}
              <div className="flex flex-col gap-2 pl-[10px]">
                <h3
                  className="text-[16px] leading-[20px] font-medium text-[#3E5460]"
                  style={{
                    fontFamily: "Raleway, sans-serif",
                    letterSpacing: "0.02em",
                  }}
                >
                  MAY WE HELP YOU?
                </h3>

                <p
                  className="text-[12px] leading-[18px] text-[#3E5460]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Our Customer Care is available from Colombo, Sri Lanka. Monday
                  through Friday from 8:30 a.m. to 6:30 p.m. and Saturday from
                  9:00 a.m. to 5:30 p.m.
                </p>

                <div className="flex flex-wrap gap-6">
                  <button
                    className="flex items-center gap-2 text-sm text-[#3E5460] underline"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Call us
                  </button>
                  <button
                    className="flex items-center gap-2 text-sm text-[#3E5460] underline"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    WhatsApp
                  </button>
                  <button
                    className="flex items-center gap-2 text-sm text-[#3E5460] underline"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Contact us by e-mail
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-[-80px]">
            <CartSummary cart={cart} />
          </div>
        </div>
      </div>
    </main>
  );
}
