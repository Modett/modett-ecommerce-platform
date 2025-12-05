"use client";

import { useState, useEffect } from "react";
import { TEXT_STYLES, COMMON_CLASSES } from "@/features/cart/constants/styles";
import { useCart } from "@/features/cart/queries";
import { getStoredCartId } from "@/features/cart/utils";
import { CheckoutProgressBar } from "@/features/checkout/components/checkout-progress-bar";
import { CartSummary } from "@/features/checkout/components/cart-summary";
import { CheckoutHelpSection } from "@/features/checkout/components/checkout-help-section";
import { Check, Info } from "lucide-react";

// Payment card logos - using Image component for actual logo files
import Image from "next/image";

export default function CheckoutPaymentPage() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cards");
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const storedCartId = getStoredCartId();
    if (storedCartId) {
      setCartId(storedCartId);
    }
  }, []);

  const { data: cart, isLoading } = useCart(cartId);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;
    // TODO: Process payment
    console.log("Payment:", { paymentMethod });
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
        <CheckoutProgressBar currentStep={4} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 md:gap-6 lg:gap-10 min-h-[750px]">
          <div className="space-y-2 max-w-[904px]">
            {/* Step 1: E-mail address (Completed) */}
            <div
              className={`w-full min-h-[80px] md:min-h-[90px] lg:h-[100px] flex flex-col border border-[#E5E0D6]`}
            >
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
              <div className="w-full min-h-[32px] md:min-h-[36px] lg:h-[40px] bg-[#EFECE5] px-3 md:px-4 lg:px-6 py-2 flex flex-col justify-center">
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
              className={`w-full min-h-[80px] md:min-h-[90px] lg:h-[100px] flex flex-col border border-[#E5E0D6]`}
            >
              <div className="flex-1 bg-[#E5E0D6] px-3 md:px-4 lg:px-6 flex justify-between items-center min-h-[48px] md:min-h-[56px] lg:min-h-[60px]">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-[#232D35] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#232D35]" />
                  </div>
                  <h2
                    className="text-base md:text-lg lg:text-[20px] leading-[24px] md:leading-[26px] lg:leading-[28px] font-normal text-[#232D35]"
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
              <div className="w-full min-h-[32px] md:min-h-[36px] lg:h-[40px] bg-[#EFECE5] px-3 md:px-4 lg:px-6 py-2 flex flex-col justify-center">
                <p
                  className="text-xs md:text-sm lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal text-[#3E5460] tracking-[0.5px] md:tracking-[0.8px] lg:tracking-[1.03px]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Colombo 1-15 shipping in 2-3 working days from order
                  confirmation
                </p>
              </div>
            </div>

            {/* Step 3: Information (Completed) */}
            <div
              className={`w-full min-h-[120px] flex flex-col border border-[#E5E0D6]`}
            >
              <div className="flex-1 bg-[#E5E0D6] px-3 md:px-4 lg:px-6 flex justify-between items-center min-h-[48px] md:min-h-[56px] lg:min-h-[60px]">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-[#232D35] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#232D35]" />
                  </div>
                  <h2
                    className="text-base md:text-lg lg:text-[20px] leading-[24px] md:leading-[26px] lg:leading-[28px] font-normal text-[#232D35]"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    3. Information
                  </h2>
                </div>
                <button
                  className="flex items-center justify-end text-[9px] md:text-[10px] leading-[16px] font-normal text-[#232D35] uppercase"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  EDIT
                </button>
              </div>
              <div className="w-full bg-[#EFECE5] pl-[63px] pr-6 py-2 flex flex-col justify-center gap-2">
                <p
                  className="text-[12px] text-[#3E5460] font-normal leading-[24px] tracking-[0px]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  delivery address
                </p>
                <div className="flex flex-col">
                  <p
                    className="text-[12px] text-[#3E5460] font-normal leading-[18px] tracking-[0px]"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Mr Test Tester
                  </p>
                  <p
                    className="text-[12px] text-[#3E5460] font-normal leading-[18px] tracking-[0px]"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    44
                  </p>
                  <p
                    className="text-[12px] text-[#3E5460] font-normal leading-[18px] tracking-[0px]"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    milan milan 10050 IT
                  </p>
                  <p
                    className="text-[12px] text-[#3E5460] font-normal leading-[18px] tracking-[0px]"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    0000000000
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4: Payment (Active) */}
            <div
              className={`${COMMON_CLASSES.pageBg} w-full max-w-[904px] border border-[#E5E0D6]`}
            >
              <div className="bg-[#232D35] p-[16px] flex items-center h-[60px]">
                <h1
                  className="text-[20px] leading-[140%] font-normal tracking-[0%] text-[#EFECE5]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  4. Payment
                </h1>
              </div>

              <div className="py-[24px] px-6 flex flex-col max-w-[780px]">
                <form
                  onSubmit={handleConfirm}
                  className="flex flex-col gap-[24px]"
                >
                  <h3
                    className="text-[16.6px] text-[#56575B] font-normal uppercase leading-[28px] tracking-[0px]"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    PAYMENT METHOD
                  </h3>

                  {/* Payment Methods */}
                  <div className="flex flex-col gap-[24px] w-full">
                    {/* Cards */}
                    <div
                      className={`rounded-[8px] overflow-hidden border ${paymentMethod === "cards" ? "bg-[#E5E0D6] border-[#3E5460]" : "bg-[#EFECE5] border-[#BBA496]"}`}
                    >
                      <label className="flex items-center justify-between px-[9px] cursor-pointer w-full h-[58px]">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "cards" ? "border-[#232D35]" : "border-[#BBA496]"}`}
                          >
                            {paymentMethod === "cards" && (
                              <div className="w-2 h-2 rounded-full bg-[#232D35]" />
                            )}
                          </div>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cards"
                            checked={paymentMethod === "cards"}
                            onChange={() => setPaymentMethod("cards")}
                            className="hidden"
                          />
                          <span
                            className="text-[14px] leading-[24px] text-[#3E5460]"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            Cards
                          </span>
                        </div>
                        <div className="flex gap-[8px]">
                          <div className="w-[58px] h-[40px] relative border border-[#E5E0D6] rounded-[4px] bg-white flex items-center justify-center overflow-hidden">
                            <Image
                              src="/images/payment/visa.png"
                              alt="Visa"
                              width={58}
                              height={40}
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="w-[58px] h-[40px] relative border border-[#E5E0D6] rounded-[4px] bg-white flex items-center justify-center overflow-hidden">
                            <Image
                              src="/images/payment/mastercard.png"
                              alt="Mastercard"
                              width={58}
                              height={40}
                              className="object-contain p-1"
                            />
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Card Form */}
                    {paymentMethod === "cards" && (
                      <div className="pb-6 pt-2">
                        <div
                          className="bg-[#F8F5F2] p-[25px] mb-4 text-[13.2px] leading-[18px] text-[#3E5460] border border-[#E5E0D6] flex items-center gap-[8px]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          <Info className="w-6 h-6 text-[#3E5460]" />
                          More information about payments
                        </div>
                        <p
                          className="text-[12px] leading-[18px] text-[#3E5460] font-normal mb-2"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          All fields are required unless marked otherwise.
                        </p>

                        <div className="flex flex-col gap-4">
                          {/* Card Number */}
                          <div className="flex flex-col">
                            <label
                              className="text-[14px] text-[#3E5460] pb-[4px] w-full block leading-[24px] tracking-[1.03px]"
                              style={{ fontFamily: "Raleway, sans-serif" }}
                            >
                              * Card number
                            </label>
                            <div className="h-[40px] px-4 bg-[#EFECE5] border border-[#BBA496] rounded-[4px] flex items-center">
                              <input
                                type="text"
                                className="w-full bg-transparent outline-none text-[#3E5460] placeholder-[#3E5460]/50"
                              />
                            </div>
                          </div>

                          {/* Expiration & CVV */}
                          <div className="flex gap-4">
                            <div className="flex-1 flex flex-col">
                              <label
                                className="text-[14px] text-[#3E5460] pb-[4px] w-full block leading-[24px] tracking-[1.03px]"
                                style={{ fontFamily: "Raleway, sans-serif" }}
                              >
                                * Expiration date
                              </label>
                              <div className="h-[40px] px-4 bg-[#EFECE5] border border-[#BBA496] rounded-[4px] flex items-center">
                                <input
                                  type="text"
                                  className="w-full bg-transparent outline-none text-[#3E5460] placeholder-[#3E5460]/50"
                                />
                              </div>
                            </div>
                            <div className="flex-1 flex flex-col">
                              <label
                                className="text-[14px] text-[#3E5460] pb-[4px] w-full block leading-[24px] tracking-[1.03px]"
                                style={{ fontFamily: "Raleway, sans-serif" }}
                              >
                                * CVV Code
                              </label>
                              <div className="h-[40px] px-4 bg-[#EFECE5] border border-[#BBA496] rounded-[4px] flex items-center">
                                <input
                                  type="text"
                                  className="w-full bg-transparent outline-none text-[#3E5460] placeholder-[#3E5460]/50"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Card Holder */}
                          <div className="flex flex-col">
                            <label
                              className="text-[14px] text-[#3E5460] pb-[4px] w-full block leading-[24px] tracking-[1.03px]"
                              style={{ fontFamily: "Raleway, sans-serif" }}
                            >
                              * Card holder
                            </label>
                            <div className="h-[40px] px-4 bg-[#EFECE5] border border-[#BBA496] rounded-[4px] flex items-center">
                              <input
                                type="text"
                                className="w-full bg-transparent outline-none text-[#3E5460] placeholder-[#3E5460]/50"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mintpay */}
                    <label
                      className={`flex items-center px-[9px] h-[58px] border rounded-[8px] cursor-pointer ${paymentMethod === "mintpay" ? "bg-[#E5E0D6] border-[#3E5460]" : "bg-[#EFECE5] border-[#BBA496]"}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "mintpay" ? "border-[#232D35]" : "border-[#BBA496]"}`}
                        >
                          {paymentMethod === "mintpay" && (
                            <div className="w-2 h-2 rounded-full bg-[#232D35]" />
                          )}
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="mintpay"
                          checked={paymentMethod === "mintpay"}
                          onChange={() => setPaymentMethod("mintpay")}
                          className="hidden"
                        />
                        <span
                          className="text-[14px] leading-[24px] text-[#3E5460]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          Mintpay
                        </span>
                      </div>
                      <div className="w-[58px] h-[40px] relative border border-[#E5E0D6] rounded-[4px] bg-white flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/payment/mintpay.png"
                          alt="Mintpay"
                          width={42}
                          height={15}
                          className="object-cover"
                        />
                      </div>
                    </label>

                    {/* Koko */}
                    <label
                      className={`flex items-center px-[9px] h-[58px] border rounded-[8px] cursor-pointer ${paymentMethod === "koko" ? "bg-[#E5E0D6] border-[#3E5460]" : "bg-[#EFECE5] border-[#BBA496]"}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "koko" ? "border-[#232D35]" : "border-[#BBA496]"}`}
                        >
                          {paymentMethod === "koko" && (
                            <div className="w-2 h-2 rounded-full bg-[#232D35]" />
                          )}
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="koko"
                          checked={paymentMethod === "koko"}
                          onChange={() => setPaymentMethod("koko")}
                          className="hidden"
                        />
                        <span
                          className="text-[14px] leading-[24px] text-[#3E5460]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          Koko
                        </span>
                      </div>
                      <div className="w-[58px] h-[40px] relative border border-[#E5E0D6] rounded-[4px] bg-white flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/payment/koko.png"
                          alt="Koko"
                          width={42}
                          height={19}
                          className="object-contain"
                        />
                      </div>
                    </label>

                    {/* American Express */}
                    <label
                      className={`flex items-center px-[9px] h-[58px] border rounded-[8px] cursor-pointer ${paymentMethod === "amex" ? "bg-[#E5E0D6] border-[#3E5460]" : "bg-[#EFECE5] border-[#BBA496]"}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "amex" ? "border-[#232D35]" : "border-[#BBA496]"}`}
                        >
                          {paymentMethod === "amex" && (
                            <div className="w-2 h-2 rounded-full bg-[#232D35]" />
                          )}
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="amex"
                          checked={paymentMethod === "amex"}
                          onChange={() => setPaymentMethod("amex")}
                          className="hidden"
                        />
                        <span
                          className="text-[14px] leading-[24px] text-[#3E5460]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          American Express
                        </span>
                      </div>
                      <div className="w-[58px] h-[40px] relative border border-[#E5E0D6] rounded-[4px] bg-white flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/payment/amex.png"
                          alt="American Express"
                          width={58}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="flex flex-col gap-[16px] w-full">
                    {/* Terms Checkbox */}
                    <label className="flex items-center cursor-pointer mx-auto w-[457px]">
                      <div className="w-[20px] h-[20px] border border-[#BBA496] flex items-center justify-center flex-shrink-0 bg-transparent">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="hidden"
                        />
                        {termsAccepted && (
                          <Check className="w-[14px] h-[14px] text-[#3E5460]" />
                        )}
                      </div>
                      <span
                        className="text-[12px] text-[#3E5460] pl-[28px] flex-1 leading-[18px] tracking-[0px]"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        *By confirming the order you accept the Modett{" "}
                        <a
                          href="#"
                          className="underline decoration-[#3E5460] underline-offset-2"
                        >
                          Terms and Conditions
                        </a>{" "}
                        of sale
                      </span>
                    </label>

                    {/* Confirm Button */}
                    <button
                      type="submit"
                      disabled={!termsAccepted}
                      className={`w-[460px] mx-auto h-[50px] bg-[#232D35] border border-[#232D35] flex items-center justify-center transition-opacity ${termsAccepted ? "hover:opacity-90" : "cursor-not-allowed"}`}
                    >
                      <span
                        className="text-[16px] font-medium text-[#E5E0D6] uppercase tracking-[4px] leading-[24px]"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        CONFIRM AND COMPLETE PURCHASE
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer Section (Reused) */}
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
