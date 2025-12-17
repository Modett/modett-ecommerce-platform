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
import { Check, Info } from "lucide-react";
import { FormInput } from "@/features/checkout/components/form-input";
import { CustomCheckbox } from "@/features/checkout/components/custom-checkbox";
import { LoadingState } from "@/features/checkout/components/loading-state";

// Payment card logos - using Image component for actual logo files
import Image from "next/image";

import { useRouter } from "next/navigation";

export default function CheckoutPaymentPage() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cards");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();

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
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <main className={`w-full min-h-screen ${COMMON_CLASSES.pageBg}`}>
      <div
        className={`w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-20 py-4 md:py-6 lg:py-8`}
      >
        <CheckoutProgressBar currentStep={4} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 md:gap-6 lg:gap-10 min-h-[750px]">
          <div className="space-y-2 max-w-[904px]">
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
                The e-mail address entered is:{" "}
                {cart?.email || "No email provided"}
              </p>
            </CompletedCheckoutStep>

            {/* Step 2: Shipping (Completed) */}
            <CompletedCheckoutStep
              stepNumber={2}
              title="Shipping"
              onEdit={() => router.push("/checkout/shipping")}
            >
              <p
                className="text-xs md:text-sm lg:text-[14px] leading-[20px] md:leading-[22px] lg:leading-[24px] font-normal text-[#3E5460] tracking-[0.5px] md:tracking-[0.8px] lg:tracking-[1.03px]"
                style={TEXT_STYLES.bodyTeal}
              >
                {cart?.shipping_address?.city || "Colombo 1-15"} shipping in 2-3
                working days from order confirmation
              </p>
            </CompletedCheckoutStep>

            {/* Step 3: Information (Completed) */}
            <CompletedCheckoutStep
              stepNumber={3}
              title="Information"
              onEdit={() => router.push("/checkout/information")}
            >
              <p
                className="text-[12px] text-[#3E5460] font-normal leading-[24px] tracking-[0px]"
                style={TEXT_STYLES.bodyTeal}
              >
                delivery address
              </p>
              <div className="flex flex-col">
                <p
                  className="text-[12px] text-[#3E5460] font-normal leading-[18px] tracking-[0px]"
                  style={TEXT_STYLES.bodyTeal}
                >
                  {cart?.shipping_address?.first_name}{" "}
                  {cart?.shipping_address?.last_name}
                </p>
                <p
                  className="text-[12px] text-[#3E5460] font-normal leading-[18px] tracking-[0px]"
                  style={TEXT_STYLES.bodyTeal}
                >
                  {cart?.shipping_address?.address_1}
                </p>
                <p
                  className="text-[12px] text-[#3E5460] font-normal leading-[18px] tracking-[0px]"
                  style={TEXT_STYLES.bodyTeal}
                >
                  {cart?.shipping_address?.city}{" "}
                  {cart?.shipping_address?.province}{" "}
                  {cart?.shipping_address?.postal_code}{" "}
                  {cart?.shipping_address?.country_code}
                </p>
                <p
                  className="text-[12px] text-[#3E5460] font-normal leading-[18px] tracking-[0px]"
                  style={TEXT_STYLES.bodyTeal}
                >
                  {cart?.shipping_address?.phone}
                </p>
              </div>
            </CompletedCheckoutStep>

            {/* Step 4: Payment (Active) */}
            <div
              className={`${COMMON_CLASSES.pageBg} w-full max-w-[904px] border border-[#E5E0D6]`}
            >
              <ActiveStepHeader stepNumber={4} title="Payment" />

              <div className="py-[24px] px-6 flex flex-col max-w-[780px]">
                <form
                  onSubmit={handleConfirm}
                  className="flex flex-col gap-[24px]"
                >
                  <h3
                    className="text-[16.6px] text-[#56575B] font-normal uppercase leading-[28px] tracking-[0px]"
                    style={TEXT_STYLES.bodyTeal}
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
                            style={TEXT_STYLES.bodyTeal}
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
                          style={TEXT_STYLES.bodyTeal}
                        >
                          <Info className="w-6 h-6 text-[#3E5460]" />
                          More information about payments
                        </div>
                        <p
                          className="text-[12px] leading-[18px] text-[#3E5460] font-normal mb-2"
                          style={TEXT_STYLES.bodyTeal}
                        >
                          All fields are required unless marked otherwise.
                        </p>

                        <div className="flex flex-col gap-4">
                          {/* Card Number */}
                          <FormInput
                            label="* Card number"
                            type="text"
                            labelClassName="text-[14px] text-[#3E5460] w-full block leading-[24px] tracking-[1.03px]"
                            labelStyle={TEXT_STYLES.bodyTeal}
                            className="rounded-[4px] border-[#BBA496] bg-transparent"
                            containerClassName="gap-1"
                            placeholder=""
                          />

                          {/* Expiration & CVV */}
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <FormInput
                                label="* Expiration date"
                                type="text"
                                labelClassName="text-[14px] text-[#3E5460] w-full block leading-[24px] tracking-[1.03px]"
                                labelStyle={TEXT_STYLES.bodyTeal}
                                className="rounded-[4px] border-[#BBA496] bg-transparent"
                                containerClassName="gap-1"
                                placeholder=""
                              />
                            </div>
                            <div className="flex-1">
                              <FormInput
                                label="* CVV Code"
                                type="text"
                                labelClassName="text-[14px] text-[#3E5460] w-full block leading-[24px] tracking-[1.03px]"
                                labelStyle={TEXT_STYLES.bodyTeal}
                                className="rounded-[4px] border-[#BBA496] bg-transparent"
                                containerClassName="gap-1"
                                placeholder=""
                              />
                            </div>
                          </div>

                          {/* Card Holder */}
                          <FormInput
                            label="* Card holder"
                            type="text"
                            labelClassName="text-[14px] text-[#3E5460] w-full block leading-[24px] tracking-[1.03px]"
                            labelStyle={TEXT_STYLES.bodyTeal}
                            className="rounded-[4px] border-[#BBA496] bg-transparent"
                            containerClassName="gap-1"
                            placeholder=""
                          />
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
                          style={TEXT_STYLES.bodyTeal}
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
                          style={TEXT_STYLES.bodyTeal}
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
                          style={TEXT_STYLES.bodyTeal}
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
                    <CustomCheckbox
                      label={
                        <>
                          *By confirming the order you accept the Modett{" "}
                          <a
                            href="#"
                            className="underline decoration-[#3E5460] underline-offset-2"
                          >
                            Terms and Conditions
                          </a>{" "}
                          of sale
                        </>
                      }
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      variant="outlined"
                      containerClassName="mx-auto w-full max-w-[457px]"
                      checkboxClassName="w-[20px] h-[20px]"
                      labelClassName="text-[12px] text-[#3E5460] pl-[28px] flex-1 leading-[18px] tracking-[0px]"
                    />

                    {/* Confirm Button */}
                    <button
                      type="submit"
                      disabled={!termsAccepted}
                      className={`w-full max-w-[460px] mx-auto h-[50px] bg-[#232D35] border border-[#232D35] flex items-center justify-center transition-opacity ${termsAccepted ? "hover:opacity-90" : "cursor-not-allowed"}`}
                    >
                      <span
                        className="text-[14px] md:text-[16px] font-medium text-[#E5E0D6] uppercase tracking-[2px] md:tracking-[4px] leading-[24px]"
                        style={TEXT_STYLES.button}
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
