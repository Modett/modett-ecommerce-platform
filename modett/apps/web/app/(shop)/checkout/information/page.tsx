"use client";

import { useState, useEffect } from "react";
import { TEXT_STYLES, COMMON_CLASSES } from "@/features/cart/constants/styles";
import { useCart } from "@/features/cart/queries";
import { getStoredCartId } from "@/features/cart/utils";
import { CheckoutProgressBar } from "@/features/checkout/components/checkout-progress-bar";
import { CartSummary } from "@/features/checkout/components/cart-summary";
import { CheckoutHelpSection } from "@/features/checkout/components/checkout-help-section";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutInformationPage() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [title, setTitle] = useState("ms");
  const [sameAddress, setSameAddress] = useState(true);
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
    // TODO: Validate form and save information
    console.log("Information:", { title, sameAddress });
    router.push("/checkout/payment");
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
        className={`w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-20 py-4 md:py-6 lg:py-8`}
      >
        <CheckoutProgressBar currentStep={3} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 md:gap-6 lg:gap-10 min-h-[750px]">
          <div className="space-y-6 max-w-[904px] pb-16">
            {/* Step 1: E-mail address (Completed) */}
            <div
              className={`w-full h-[100px] flex flex-col border border-[#E5E0D6]`}
            >
              {/* Header Part */}
              <div className="flex-1 bg-[#E5E0D6] px-4 flex justify-between items-center h-[60px]">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-[#232D35] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#232D35]" />
                  </div>
                  <h2
                    className="text-[20px] leading-[140%] font-normal text-[#232D35] tracking-[0px]"
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
              <div className="w-full h-[40px] bg-[#EFECE5] px-6 py-2 flex flex-col justify-center">
                <p
                  className="text-xs md:text-sm lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal text-[#3E5460] tracking-[0.5px] md:tracking-[0.8px] lg:tracking-[1.03px]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  The e-mail address entered is: test@gmail.com
                </p>
              </div>
            </div>

            {/* Step 2: Shipping (Completed) */}
            <div
              className={`w-full h-[100px] flex flex-col border border-[#E5E0D6]`}
            >
              {/* Header Part */}
              <div className="flex-1 bg-[#E5E0D6] px-4 flex justify-between items-center h-[60px]">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-[#232D35] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#232D35]" />
                  </div>
                  <h2
                    className="text-[20px] leading-[140%] font-normal text-[#232D35] tracking-[0px]"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    2. Shipping
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
              <div className="w-full h-[40px] bg-[#EFECE5] px-6 py-2 flex flex-col justify-center">
                <p
                  className="text-xs md:text-sm lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal text-[#3E5460] tracking-[0.5px] md:tracking-[0.8px] lg:tracking-[1.03px]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Colombo 1-15 shipping in 2-3 working days from order
                  confirmation
                </p>
              </div>
            </div>

            {/* Step 3: Information (Active) */}
            <div className={`${COMMON_CLASSES.pageBg} w-full max-w-[904px]`}>
              <div className="bg-[#232D35] p-4 flex items-center">
                <h1
                  className="text-[20px] leading-[140%] font-normal text-[#EFECE5] tracking-[0px]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  3. Information
                </h1>
              </div>

              <div className="p-6 flex flex-col gap-2">
                <form onSubmit={handleContinue}>
                  <div className="mb-6 md:mb-8">
                    <p
                      className="text-[16px] text-[#3E5460] font-medium leading-[20px] tracking-[0.02em]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      Where do you want your order to be shipped?
                    </p>

                    {/* Title Radio Buttons */}
                    <div className="mb-6">
                      <label
                        className="block text-[12px] text-[#232D35] mb-2 font-normal leading-[18px] tracking-[0px]"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        Title *
                      </label>
                      <div className="flex gap-6">
                        {["Mr.", "Ms.", "Miss", "Mrs."].map((t) => (
                          <label
                            key={t}
                            className="relative flex items-center h-[22px] pl-[28px] cursor-pointer"
                          >
                            <div
                              className={`absolute left-0 w-[18px] h-[18px] rounded-full border flex items-center justify-center ${title === t.toLowerCase().replace(".", "") ? "border-[#3E5460]" : "border-[#BBA496]"}`}
                            >
                              {title === t.toLowerCase().replace(".", "") && (
                                <div className="w-2 h-2 rounded-full bg-[#3E5460]" />
                              )}
                            </div>
                            <input
                              type="radio"
                              name="title"
                              value={t.toLowerCase().replace(".", "")}
                              checked={
                                title === t.toLowerCase().replace(".", "")
                              }
                              onChange={() =>
                                setTitle(t.toLowerCase().replace(".", ""))
                              }
                              className="hidden"
                            />
                            <span
                              className="text-[12px] text-[#232D35] font-normal leading-[18px] tracking-[0px]"
                              style={{ fontFamily: "Raleway, sans-serif" }}
                            >
                              {t}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col gap-2 pb-4 w-full">
                        <label
                          className="text-[12px] text-[#232D35] font-normal leading-[18px] tracking-[0px]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          First Name *
                        </label>
                        <input
                          type="text"
                          className="w-full h-[40px] bg-[#EFECE5] border border-[#D4C4A8] px-3 outline-none focus:border-[#3E5460]"
                        />
                      </div>
                      <div className="flex flex-col gap-2 pb-4 w-full">
                        <label
                          className="text-[12px] text-[#232D35] font-normal leading-[18px] tracking-[0px]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          Last Name *
                        </label>
                        <input
                          type="text"
                          className="w-full h-[40px] bg-[#EFECE5] border border-[#D4C4A8] px-3 outline-none focus:border-[#3E5460]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[12px] text-[#3E5460]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          Phone *
                        </label>
                        <input
                          type="text"
                          className="w-full h-[40px] bg-[#EFECE5] border border-[#D4C4A8] px-3 outline-none focus:border-[#3E5460]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[12px] text-[#3E5460]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          Address *
                        </label>
                        <input
                          type="text"
                          className="w-full h-[40px] bg-[#EFECE5] border border-[#D4C4A8] px-3 outline-none focus:border-[#3E5460]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[12px] text-[#3E5460]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          City *
                        </label>
                        <input
                          type="text"
                          className="w-full h-[40px] bg-[#EFECE5] border border-[#D4C4A8] px-3 outline-none focus:border-[#3E5460]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[12px] text-[#3E5460]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          className="w-full h-[40px] bg-[#EFECE5] border border-[#D4C4A8] px-3 outline-none focus:border-[#3E5460]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[12px] text-[#3E5460]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          State *
                        </label>
                        <input
                          type="text"
                          className="w-full h-[40px] bg-[#EFECE5] border border-[#D4C4A8] px-3 outline-none focus:border-[#3E5460]"
                        />
                      </div>
                    </div>

                    {/* Same Address Checkbox */}
                    <label className="flex items-center cursor-pointer mb-8">
                      <div
                        className={`w-4 h-4 md:w-5 md:h-5 border flex items-center justify-center flex-shrink-0 ${sameAddress ? "border-[#232D35] bg-[#232D35]" : "border-[#765C4D]"}`}
                      >
                        <input
                          type="checkbox"
                          checked={sameAddress}
                          onChange={(e) => setSameAddress(e.target.checked)}
                          className="hidden"
                        />
                        {sameAddress && (
                          <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                        )}
                      </div>
                      <span
                        className="text-[11px] md:text-xs text-[#3E5460] pl-3 md:pl-4 flex-1 leading-[16px] md:leading-[18px]"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        The delivery address is the same as the invoice address
                      </span>
                    </label>

                    {/* Continue Button */}
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
                </form>
              </div>
            </div>

            {/* Step 4: Payment (Future) */}
            <div className="bg-[#E5E0D6] border border-[#E5E0D6] h-[50px] md:h-[56px] lg:h-[60px] flex items-center px-3 md:px-4 lg:px-6">
              <h2
                className="text-base md:text-[17px] lg:text-[17.7px] leading-[24px] md:leading-[26px] lg:leading-[28px] font-normal text-[#BBA496]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                4. Payment
              </h2>
            </div>

            {/* Footer Section */}
            <CheckoutHelpSection />
          </div>

          <div className="lg:mt-[-80px]">
            <CartSummary cart={cart} />
          </div>
        </div>
      </div>
    </main>
  );
}
