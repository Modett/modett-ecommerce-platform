"use client";

import { useState, useEffect } from "react";
import { TEXT_STYLES, COMMON_CLASSES } from "@/features/cart/constants/styles";
import { useCart } from "@/features/cart/queries";
import { getStoredCartId } from "@/features/cart/utils";
import { CheckoutProgressBar } from "@/features/checkout/components/checkout-progress-bar";
import { CartSummary } from "@/features/checkout/components/cart-summary";
import { CheckoutHelpSection } from "@/features/checkout/components/checkout-help-section";
import { CompletedCheckoutStep } from "@/features/checkout/components/completed-checkout-step";
import { ActiveStepHeader } from "@/features/checkout/components/active-step-header";
import { FutureStep } from "@/features/checkout/components/future-step";
import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import { CustomCheckbox } from "@/features/checkout/components/custom-checkbox";
import { LoadingState } from "@/features/checkout/components/loading-state";
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

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Priority: Cart email (from backend) > Session storage > Default
    if (cart?.email) {
      setEmail(cart.email);
    } else {
      const storedEmail = sessionStorage.getItem("checkout_email");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [cart?.email]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save shipping information

    router.push("/checkout/information");
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <main className={`w-full min-h-screen ${COMMON_CLASSES.pageBg}`}>
      <div
        className={`w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-20 py-4 md:py-6 lg:py-8`}
      >
        <CheckoutProgressBar currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 md:gap-6 lg:gap-10 min-h-[750px]">
          <div className="space-y-2">
            {/* Step 1: E-mail address (Completed) */}
            <CompletedCheckoutStep
              stepNumber={1}
              title="E-mail address"
              onEdit={() => router.push("/checkout")}
            >
              <p
                className="text-[12px] text-[#3E5460] font-normal leading-[18px] tracking-[0px]"
                style={TEXT_STYLES.bodyTeal}
              >
                The e-mail address entered is: {email}
              </p>
            </CompletedCheckoutStep>

            {/* Step 2: Shipping (Active) */}
            <div className={`${COMMON_CLASSES.pageBg} w-full max-w-[904px]`}>
              <ActiveStepHeader stepNumber={2} title="Shipping" />

              <div className="p-3 md:p-4 lg:p-6 flex flex-col gap-2">
                <form onSubmit={handleContinue}>
                  <div className="mb-6 md:mb-8">
                    <h3
                      className="w-full flex flex-col text-sm md:text-base lg:text-[16px] leading-[18px] md:leading-[20px] font-medium mb-3 md:mb-4 text-[#3E5460] tracking-[0.02em]"
                      style={TEXT_STYLES.bodyTeal}
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
                        style={TEXT_STYLES.button}
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
                        style={TEXT_STYLES.button}
                      >
                        PICK UP IN BOUTIQUE
                      </button>
                    </div>

                    <p
                      className="text-xs md:text-[13px] lg:text-[13.1px] text-[#56575B] mb-3 md:mb-4 font-light leading-[16px] md:leading-[18px]"
                      style={TEXT_STYLES.button}
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
                            style={TEXT_STYLES.bodyTeal}
                          >
                            Colombo 1-15
                          </span>
                          <span
                            className="text-[11px] md:text-[12px] lg:text-[12.3px] text-[#3E5460] font-light leading-[16px] md:leading-[18px] whitespace-nowrap"
                            style={TEXT_STYLES.bodyTeal}
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
                            style={TEXT_STYLES.bodyTeal}
                          >
                            Suburbs near Colombo
                          </span>
                          <span
                            className="text-[11px] md:text-[12px] lg:text-[12.3px] text-[#3E5460] font-light leading-[16px] md:leading-[18px] whitespace-nowrap"
                            style={TEXT_STYLES.bodyTeal}
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
                          style={TEXT_STYLES.button}
                        >
                          packaging
                        </h3>
                        <CustomCheckbox
                          label="Do you want a gift box for your order?"
                          checked={isGift}
                          onChange={(e) => setIsGift(e.target.checked)}
                          containerClassName="items-start md:items-center"
                          labelClassName="text-[11px] md:text-xs text-[#3E5460] pl-3 md:pl-6 lg:pl-[28px] flex-1 leading-[16px] md:leading-[18px]"
                        />
                      </div>

                      <div className="flex justify-center">
                        <CheckoutButton />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Step 3: Information (Future) */}
            <FutureStep stepNumber={3} title="Information" />

            {/* Step 4: Payment (Future) */}
            <FutureStep stepNumber={4} title="Payment" />

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
