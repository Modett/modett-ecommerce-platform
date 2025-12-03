"use client";

import { useState, useEffect } from "react";
import { TEXT_STYLES, COMMON_CLASSES } from "@/features/cart/constants/styles";
import { useCart } from "@/features/cart/queries";
import { getStoredCartId } from "@/features/cart/utils";
import { CheckoutProgressBar } from "@/features/checkout/components/checkout-progress-bar";
import { CartSummary } from "@/features/checkout/components/cart-summary";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutShippingPage() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<"home" | "boutique">(
    "home"
  );
  const [shippingOption, setShippingOption] = useState<"colombo" | "suburbs">(
    "colombo"
  );
  const [isGift, setIsGift] = useState(false);
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
    // TODO: Save shipping information
    console.log("Shipping:", { shippingMethod, shippingOption, isGift });
    router.push("/checkout/information");
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
        className={`w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-20 py-4 md:py-6 lg:py-8`}
      >
        <CheckoutProgressBar currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 md:gap-6 lg:gap-10">
          <div className="space-y-2">
            {/* Step 1: E-mail address (Completed) */}
            <div
              className={`w-full min-h-[80px] md:min-h-[90px] lg:h-[100px] flex flex-col border border-[#E5E0D6]`}
            >
              {/* Header Part */}
              <div className="flex-1 bg-[#E5E0D6] px-3 md:px-4 lg:px-6 flex justify-between items-center min-h-[48px] md:min-h-[56px] lg:min-h-[60px]">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-[#232D35] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#232D35]" />
                  </div>
                  <h2
                    className="text-base md:text-lg lg:text-[20px] leading-[24px] md:leading-[26px] lg:leading-[28px] font-normal text-[#232D35]"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    1. E-mail address
                  </h2>
                </div>
                <button
                  className="flex items-center justify-end text-[9px] md:text-[10px] leading-[16px] font-normal text-[#232D35] uppercase"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  EDIT
                </button>
              </div>

              {/* Content Part */}
              <div className="w-full min-h-[32px] md:min-h-[36px] lg:h-[40px] bg-[#EFECE5] px-3 md:px-4 lg:px-6 py-2 flex flex-col justify-center">
                <p
                  className="text-xs md:text-sm lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal text-[#3E5460] tracking-[0.5px] md:tracking-[0.8px] lg:tracking-[1.03px]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  The e-mail address entered is: test@gmail.com
                </p>
              </div>
            </div>

            {/* Step 2: Shipping (Active) */}
            <div className={`${COMMON_CLASSES.pageBg} w-full max-w-[904px]`}>
              <div className="bg-[#232D35] p-4 flex items-center">
                <h1
                  className="text-[20px] leading-[140%] font-normal tracking-[0%] text-[#EFECE5]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  2. Shipping
                </h1>
              </div>

              <div className="p-3 md:p-4 lg:p-6 flex flex-col gap-2">
                <form onSubmit={handleContinue}>
                  <div className="mb-6 md:mb-8">
                    <h3
                      className="w-full flex flex-col text-sm md:text-base lg:text-[16px] leading-[18px] md:leading-[20px] font-medium mb-3 md:mb-4 text-[#3E5460] tracking-[0.02em]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      Shipping method
                    </h3>

                    {/* Shipping Method Tabs */}
                    <div className="flex w-full mb-4 md:mb-6 pt-4 md:pt-6 flex-nowrap">
                      <button
                        type="button"
                        onClick={() => setShippingMethod("home")}
                        className={`flex-1 h-[50px] md:h-[56px] lg:h-[60px] flex items-center justify-center text-[10px] md:text-[11px] lg:text-xs tracking-[0.5px] md:tracking-[0.8px] lg:tracking-[1px] uppercase bg-[#EFECE5] ${
                          shippingMethod === "home"
                            ? "text-[#232D35] border-t border-x border-[#BBA496] border-b-0"
                            : "text-[#BBA496] border border-transparent"
                        }`}
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        RECEIVE AT HOME
                      </button>
                      <button
                        type="button"
                        onClick={() => setShippingMethod("boutique")}
                        className={`flex-1 h-[50px] md:h-[56px] lg:h-[60px] flex items-center justify-center text-[10px] md:text-[11px] lg:text-xs tracking-[0.5px] md:tracking-[0.8px] lg:tracking-[1px] uppercase bg-[#EFECE5] ${
                          shippingMethod === "boutique"
                            ? "text-[#232D35] border-t border-x border-[#BBA496] border-b-0"
                            : "text-[#BBA496] border border-transparent"
                        }`}
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        PICK UP IN BOUTIQUE
                      </button>
                    </div>

                    <p
                      className="text-xs md:text-[13px] lg:text-[13.1px] text-[#56575B] mb-3 md:mb-4 font-light leading-[16px] md:leading-[18px]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      We offer shipping on all orders with Express Worldwide
                      service.
                    </p>

                    {/* Shipping Options */}
                    <div className="w-full flex flex-col md:flex-row gap-2 mb-6 md:mb-8">
                      <label
                        className={`relative flex-1 flex items-center p-3 md:p-4 border cursor-pointer min-h-[48px] md:h-[54px] rounded-[6px] md:rounded-[8px] ${
                          shippingOption === "colombo"
                            ? "border-[#3E5460] bg-[#E5E0D6]"
                            : "border-[#E5E0D6] bg-transparent"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingOption"
                          value="colombo"
                          checked={shippingOption === "colombo"}
                          onChange={() => setShippingOption("colombo")}
                          className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] text-[#3E5460] border-[#BBA496] focus:ring-[#3E5460]"
                        />
                        <div className="ml-3 md:ml-4 flex-1 flex justify-between items-center gap-2">
                          <span
                            className="text-[11px] md:text-[12px] lg:text-[12.3px] text-[#3E5460] font-light leading-[16px] md:leading-[18px]"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            Colombo 1-15
                          </span>
                          <span
                            className="text-[11px] md:text-[12px] lg:text-[12.3px] text-[#3E5460] font-light leading-[16px] md:leading-[18px] whitespace-nowrap"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            Rs 250.00
                          </span>
                        </div>
                      </label>

                      <label
                        className={`relative flex-1 flex items-center p-3 md:p-4 border cursor-pointer min-h-[48px] md:h-[54px] rounded-[6px] md:rounded-[8px] ${
                          shippingOption === "suburbs"
                            ? "border-[#3E5460] bg-[#E5E0D6]"
                            : "border-[#E5E0D6] bg-transparent"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingOption"
                          value="suburbs"
                          checked={shippingOption === "suburbs"}
                          onChange={() => setShippingOption("suburbs")}
                          className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] text-[#3E5460] border-[#BBA496] focus:ring-[#3E5460]"
                        />
                        <div className="ml-3 md:ml-4 flex-1 flex justify-between items-center gap-2">
                          <span
                            className="text-[11px] md:text-[12px] lg:text-[12.3px] text-[#3E5460] font-light leading-[16px] md:leading-[18px]"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            Suburbs near Colombo
                          </span>
                          <span
                            className="text-[11px] md:text-[12px] lg:text-[12.3px] text-[#3E5460] font-light leading-[16px] md:leading-[18px] whitespace-nowrap"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            Rs 250.00
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Packaging & Continue */}
                    <div className="border-t border-[#E5E5E5] pt-6 md:pt-8 lg:pt-[33px] pb-4 md:pb-6 lg:pb-[24px] flex flex-col gap-3 md:gap-4 lg:gap-[16px]">
                      <div>
                        <h3
                          className="text-xs md:text-sm lg:text-[14px] font-normal mb-3 md:mb-4 text-[#56575B] leading-[20px] md:leading-[22px] lg:leading-[24px] tracking-[0.5px] md:tracking-[0.8px] lg:tracking-[1.03px]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          packaging
                        </h3>
                        <label className="flex items-start md:items-center cursor-pointer">
                          <div
                            className={`w-4 h-4 md:w-5 md:h-5 border flex items-center justify-center flex-shrink-0 ${isGift ? "border-[#232D35] bg-[#232D35]" : "border-[#765C4D]"}`}
                          >
                            <input
                              type="checkbox"
                              checked={isGift}
                              onChange={(e) => setIsGift(e.target.checked)}
                              className="hidden"
                            />
                            {isGift && (
                              <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                            )}
                          </div>
                          <span
                            className="text-[11px] md:text-xs text-[#3E5460] pl-3 md:pl-6 lg:pl-[28px] flex-1 leading-[16px] md:leading-[18px]"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            Do you want a gift box for your order?
                          </span>
                        </label>
                      </div>

                      <div className="flex justify-center">
                        <button
                          type="submit"
                          className="w-full md:w-[280px] lg:w-[300px] h-[44px] md:h-[48px] lg:h-[50px] bg-[#232D35] border border-[#232D35] px-6 md:px-8 lg:px-[31px] flex items-center justify-center hover:opacity-90 transition-opacity"
                        >
                          <span
                            className="text-sm md:text-[15px] lg:text-[16px] font-medium text-[#E5E0D6] uppercase tracking-[2px] md:tracking-[3px] lg:tracking-[4px] leading-[20px] md:leading-[22px] lg:leading-[24px]"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            CONTINUE
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Future Steps */}
            <div className="bg-[#E5E0D6] border border-[#E5E0D6] h-[50px] md:h-[56px] lg:h-[60px] flex items-center px-3 md:px-4 lg:px-6">
              <h2
                className="text-base md:text-[17px] lg:text-[17.7px] leading-[24px] md:leading-[26px] lg:leading-[28px] font-normal text-[#BBA496]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                3. Information
              </h2>
            </div>

            <div className="bg-[#E5E0D6] border border-[#E5E0D6] h-[50px] md:h-[56px] lg:h-[60px] flex items-center px-3 md:px-4 lg:px-6">
              <h2
                className="text-base md:text-[17px] lg:text-[17.7px] leading-[24px] md:leading-[26px] lg:leading-[28px] font-normal text-[#BBA496]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                4. Payment
              </h2>
            </div>

            <div className="mt-6 md:mt-8 pt-4 md:pt-6 lg:pt-[25px] grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[261px_1fr] gap-4 md:gap-6 lg:gap-8">
              {/* Left Column: Shipping & Returns */}
              <div className="space-y-4 md:space-y-6 md:border-r border-[#E5E0D6] md:pr-3 lg:pr-[11px]">
                <div className="flex items-start gap-2 md:gap-[6px]">
                  <div className="flex-shrink-0">
                    <svg
                      width="20"
                      height="20"
                      className="md:w-6 md:h-6"
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
                      className="text-[11px] md:text-[12px] leading-[16px] md:leading-[18px] text-[#3E5460]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      We offer free shipping on all orders with Express
                      Worldwide service.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 md:gap-[6px]">
                  <div className="flex-shrink-0">
                    <svg
                      width="20"
                      height="20"
                      className="md:w-6 md:h-6"
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
                      className="text-[11px] md:text-[12px] leading-[16px] md:leading-[18px] text-[#3E5460]"
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
              <div className="flex flex-col gap-2 md:pl-3 lg:pl-[10px]">
                <h3
                  className="text-sm md:text-[15px] lg:text-[16px] leading-[18px] md:leading-[20px] font-medium text-[#3E5460]"
                  style={{
                    fontFamily: "Raleway, sans-serif",
                    letterSpacing: "0.02em",
                  }}
                >
                  MAY WE HELP YOU?
                </h3>

                <p
                  className="text-[11px] md:text-[12px] leading-[16px] md:leading-[18px] text-[#3E5460]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Our Customer Care is available from Colombo, Sri Lanka. Monday
                  through Friday from 8:30 a.m. to 6:30 p.m. and Saturday from
                  9:00 a.m. to 5:30 p.m.
                </p>

                <div className="flex flex-wrap gap-4 md:gap-6">
                  <button
                    className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#3E5460] underline"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    <svg
                      width="16"
                      height="16"
                      className="md:w-[18px] md:h-[18px]"
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
                    className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#3E5460] underline"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    <svg
                      width="16"
                      height="16"
                      className="md:w-[18px] md:h-[18px]"
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
                    className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#3E5460] underline"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    <svg
                      width="16"
                      height="16"
                      className="md:w-[18px] md:h-[18px]"
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

          <div className="lg:mt-[-80px]">
            <CartSummary cart={cart} />
          </div>
        </div>
      </div>
    </main>
  );
}
