"use client";

import { useState, useEffect } from "react";
import { TEXT_STYLES, COMMON_CLASSES } from "@/features/cart/constants/styles";
import { useCart } from "@/features/cart/queries";
import { getStoredCartId } from "@/features/cart/utils";
import { CheckoutProgressBar } from "@/features/checkout/components/checkout-progress-bar";
import { CartSummary } from "@/features/checkout/components/cart-summary";
import { Check } from "lucide-react";

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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 md:gap-6 lg:gap-10">
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
            <div className={`${COMMON_CLASSES.pageBg} w-full max-w-[904px]`}>
              <div className="bg-[#232D35] p-[16px] flex items-center h-[60px]">
                <h1
                  className="text-[20px] leading-[140%] font-normal tracking-[0%] text-[#EFECE5]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  4. Payment
                </h1>
              </div>

              <div className="py-[24px] px-6 flex flex-col max-w-[780px]">
                <form onSubmit={handleConfirm} className="flex flex-col gap-[24px]">
                  <h3
                    className="text-[16.6px] text-[#56575B] font-normal uppercase leading-[28px] tracking-[0px]"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    PAYMENT METHOD
                  </h3>

                  {/* Payment Methods */}
                  <div className="flex flex-col gap-[0.03px] w-[732px]">
                    {/* Cards */}
                    <div
                      className={`rounded-[8px] overflow-hidden border ${paymentMethod === "cards" ? "bg-[#E5E0D6] border-[#765C4D]" : "bg-[#EFECE5] border-transparent"}`}
                    >
                      <label className="flex items-center justify-between p-[10px] cursor-pointer w-full h-[60px]">
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
                            className="text-[14px] text-[#3E5460]"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            Cards
                          </span>
                        </div>
                        <div className="flex gap-2">
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
                        <div className="bg-[#F8F5F2] p-[25px] mb-4 text-[12px] text-[#232D35] border border-[#E5E0D6]">
                          More information about payments
                        </div>
                        <p className="text-[10px] text-[#232D35] mb-2">
                          All fields are required unless marked otherwise.
                        </p>

                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1">
                            <label
                              className="text-[12px] text-[#3E5460]"
                              style={{ fontFamily: "Raleway, sans-serif" }}
                            >
                              Card number *
                            </label>
                            <input
                              type="text"
                              className="w-full h-[40px] bg-[#EFECE5] border border-[#D4C4A8] px-3 outline-none focus:border-[#3E5460]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <label
                                className="text-[12px] text-[#3E5460]"
                                style={{ fontFamily: "Raleway, sans-serif" }}
                              >
                                Expiration date *
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
                                CVV Code *
                              </label>
                              <input
                                type="text"
                                className="w-full h-[40px] bg-[#EFECE5] border border-[#D4C4A8] px-3 outline-none focus:border-[#3E5460]"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label
                              className="text-[12px] text-[#3E5460]"
                              style={{ fontFamily: "Raleway, sans-serif" }}
                            >
                              Card holder *
                            </label>
                            <input
                              type="text"
                              className="w-full h-[40px] bg-[#EFECE5] border border-[#D4C4A8] px-3 outline-none focus:border-[#3E5460]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mintpay */}
                    <label
                      className={`flex items-center p-4 border rounded-[8px] cursor-pointer ${paymentMethod === "mintpay" ? "bg-[#E5E0D6] border-[#3E5460]" : "bg-[#EFECE5] border-[#E5E0D6]"}`}
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
                          className="text-[14px] text-[#3E5460]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          Mintpay
                        </span>
                      </div>
                      <div className="w-[58px] h-[40px] relative border border-[#E5E0D6] rounded-[4px] bg-white flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/payment/mintpay.png"
                          alt="Mintpay"
                          width={58}
                          height={40}
                          className="object-contain p-1"
                        />
                      </div>
                    </label>

                    {/* Koko */}
                    <label
                      className={`flex items-center p-4 border rounded-[8px] cursor-pointer ${paymentMethod === "koko" ? "bg-[#E5E0D6] border-[#3E5460]" : "bg-[#EFECE5] border-[#E5E0D6]"}`}
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
                          className="text-[14px] text-[#3E5460]"
                          style={{ fontFamily: "Raleway, sans-serif" }}
                        >
                          Koko
                        </span>
                      </div>
                      <div className="w-[58px] h-[40px] relative border border-[#E5E0D6] rounded-[4px] bg-white flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/payment/koko.png"
                          alt="Koko"
                          width={58}
                          height={40}
                          className="object-contain p-1"
                        />
                      </div>
                    </label>

                    {/* American Express */}
                    <label
                      className={`flex items-center p-4 border rounded-[8px] cursor-pointer ${paymentMethod === "amex" ? "bg-[#E5E0D6] border-[#3E5460]" : "bg-[#EFECE5] border-[#E5E0D6]"}`}
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
                          className="text-[14px] text-[#3E5460]"
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
                          className="object-contain p-1"
                        />
                      </div>
                    </label>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-center cursor-pointer">
                    <div
                      className={`w-4 h-4 md:w-5 md:h-5 border flex items-center justify-center flex-shrink-0 ${termsAccepted ? "border-[#232D35] bg-[#232D35]" : "border-[#765C4D]"}`}
                    >
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="hidden"
                      />
                      {termsAccepted && (
                        <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                      )}
                    </div>
                    <span
                      className="text-[11px] md:text-xs text-[#3E5460] pl-3 md:pl-4 flex-1 leading-[16px] md:leading-[18px]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      By confirming the order you accept the Modett{" "}
                      <a href="#" className="underline">
                        Terms and Conditions
                      </a>{" "}
                      of sale
                    </span>
                  </label>

                  {/* Confirm Button */}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={!termsAccepted}
                      className={`w-full md:w-[320px] lg:w-[350px] h-[44px] md:h-[48px] lg:h-[50px] bg-[#232D35] border border-[#232D35] px-6 md:px-8 lg:px-[31px] flex items-center justify-center transition-opacity ${termsAccepted ? "hover:opacity-90" : "opacity-50 cursor-not-allowed"}`}
                    >
                      <span
                        className="text-sm md:text-[15px] lg:text-[16px] font-medium text-[#E5E0D6] uppercase tracking-[2px] md:tracking-[3px] lg:tracking-[4px] leading-[20px] md:leading-[22px] lg:leading-[24px]"
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
