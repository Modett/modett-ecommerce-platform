"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Info } from "lucide-react";
import { TEXT_STYLES, COMMON_CLASSES } from "@/features/cart/constants/styles";
import { useCart } from "@/features/cart/queries";
import { getStoredCartId, clearCartData } from "@/features/cart/utils";
import { CheckoutProgressBar } from "@/features/checkout/components/checkout-progress-bar";
import { CartSummary } from "@/features/checkout/components/cart-summary";
import { CheckoutHelpSection } from "@/features/checkout/components/checkout-help-section";
import { CompletedCheckoutStep } from "@/features/checkout/components/completed-checkout-step";
import { ActiveStepHeader } from "@/features/checkout/components/active-step-header";
import { CustomCheckbox } from "@/features/checkout/components/custom-checkbox";
import { LoadingState } from "@/features/checkout/components/loading-state";
import { usePayableIPG } from "@/features/checkout/hooks/use-payable-ipg";
import * as cartApi from "@/features/cart/api";

export default function CheckoutPaymentPage() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cards");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const router = useRouter();

  const { createPayment, loading: paymentLoading } = usePayableIPG();

  useEffect(() => {
    const storedCartId = getStoredCartId();
    if (storedCartId) {
      setCartId(storedCartId);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");
    if (errorParam === "payment_cancelled") {
      setError("Payment was cancelled. Please try again.");
    }
  }, []);

  const { data: cart, isLoading, refetch } = useCart(cartId);

  useEffect(() => {
    if (cart && (!cart.items || cart.items.length === 0)) {
      router.push("/cart");
    }
  }, [cart, router]);

  useEffect(() => {
    const initCheckout = async () => {
      if (!cartId || !cart || checkoutId) return;
      if (!cart.items || cart.items.length === 0) return;

      try {
        const checkout = await cartApi.initializeCheckout(cartId);
        setCheckoutId(checkout.checkoutId);

        // Safety net: Prevent reusing completed checkout sessions
        try {
          const detailedCheckout = await cartApi.getCheckout(checkout.checkoutId);
          if (detailedCheckout.status === "completed" || detailedCheckout.status === "paid") {
            console.warn("[Checkout] Detected completed checkout session, redirecting to success");
            clearCartData();
            window.location.href = `/checkout/success?checkoutId=${checkout.checkoutId}`;
            return;
          }
        } catch (detailErr) {
          console.error("[Checkout] Failed to fetch checkout status:", detailErr);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("[Checkout] Failed to initialize checkout:", err);

        // If cart has a completed order, clear cart data and redirect to cart page
        if (errorMessage.includes("completed order")) {
          console.warn("[Checkout] Cart has completed order, clearing cart data");
          clearCartData();
          setError("Your previous order is complete. Please add items to your cart to place a new order.");
          setTimeout(() => {
            window.location.href = "/cart";
          }, 2000);
        } else {
          setError("Failed to initialize checkout. Please try again.");
        }
      }
    };

    initCheckout();
  }, [cartId, cart, checkoutId]);

  useEffect(() => {
    if (cartId) {
      refetch();
    }
  }, [cartId, refetch]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      setError("Please accept the terms and conditions to continue");
      return;
    }

    if (!cartId || !cart) {
      setError("Cart not found");
      return;
    }

    if (!cart.email) {
      setError("Email is required. Please go back to step 1");
      return;
    }

    if (!cart.shippingFirstName || !cart.shippingCity) {
      setError("Shipping address is required. Please go back to step 3");
      return;
    }

    if (!checkoutId) {
      setError("Checkout session not initialized. Please try again.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const customerName = `${cart.shippingFirstName || ""} ${cart.shippingLastName || ""}`.trim();

      const paymentResult = await createPayment({
        orderId: checkoutId,
        amount: cart.summary.total,
        customerEmail: cart.email,
        customerName: customerName || "Guest Customer",
        customerPhone: cart.shippingPhone || undefined,
        returnUrl: `${window.location.origin}/checkout/success?checkoutId=${checkoutId}&intentId=${checkoutId}`,
        cancelUrl: `${window.location.origin}/checkout/payment?error=payment_cancelled`,
        description: `Order for ${cart.items.length} item(s)`,
        shippingAddress: {
          firstName: cart.shippingFirstName || "",
          lastName: cart.shippingLastName || "",
          addressLine1: cart.shippingAddress1 || "",
          addressLine2: cart.shippingAddress2 || "",
          city: cart.shippingCity || "",
          state: cart.shippingProvince || "",
          postalCode: cart.shippingPostalCode || "",
          country: cart.shippingCountryCode || "LK",
          phone: cart.shippingPhone || "",
        },
        billingAddress: {
          firstName: cart.billingFirstName || cart.shippingFirstName || "",
          lastName: cart.billingLastName || cart.shippingLastName || "",
          addressLine1: cart.billingAddress1 || cart.shippingAddress1 || "",
          addressLine2: cart.billingAddress2 || cart.shippingAddress2 || "",
          city: cart.billingCity || cart.shippingCity || "",
          state: cart.billingProvince || cart.shippingProvince || "",
          postalCode: cart.billingPostalCode || cart.shippingPostalCode || "",
          country: cart.billingCountryCode || cart.shippingCountryCode || "LK",
          phone: cart.billingPhone || cart.shippingPhone || "",
        },
      });

      if (paymentResult.success && paymentResult.redirectUrl) {
        window.location.href = paymentResult.redirectUrl;
      } else {
        setError(paymentResult.error || "Failed to create payment session");
        setProcessing(false);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize payment. Please try again.";
      console.error("[Payment] Payment initialization failed:", err);
      setError(errorMessage);
      setProcessing(false);
    }
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
                {cart?.shippingOption === "colombo"
                  ? "Colombo 1-15 shipping in 2-3 working days from order confirmation"
                  : cart?.shippingOption === "suburbs"
                    ? "Suburbs shipping in 3-5 working days from order confirmation"
                    : "Shipping details not provided"}
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
                  {cart?.shippingFirstName || ""} {cart?.shippingLastName || ""}
                </p>
                <p
                  className="text-[12px] text-[#3E5460] font-normal leading-[18px] tracking-[0px]"
                  style={TEXT_STYLES.bodyTeal}
                >
                  {cart?.shippingAddress1 || ""}
                </p>
                <p
                  className="text-[12px] text-[#3E5460] font-normal leading-[18px] tracking-[0px]"
                  style={TEXT_STYLES.bodyTeal}
                >
                  {cart?.shippingCity || ""} {cart?.shippingProvince || ""}{" "}
                  {cart?.shippingPostalCode || ""}{" "}
                  {cart?.shippingCountryCode || ""}
                </p>
                <p
                  className="text-[12px] text-[#3E5460] font-normal leading-[18px] tracking-[0px]"
                  style={TEXT_STYLES.bodyTeal}
                >
                  {cart?.shippingPhone || ""}
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

                    {/* Payment Gateway Info */}
                    {paymentMethod === "cards" && (
                      <div className="pb-6 pt-2">
                        <div
                          className="bg-[#F8F5F2] p-[25px] mb-4 text-[13.2px] leading-[18px] text-[#3E5460] border border-[#E5E0D6] flex items-center gap-[8px]"
                          style={TEXT_STYLES.bodyTeal}
                        >
                          <Info className="w-6 h-6 text-[#3E5460]" />
                          You will be redirected to PAYable IPG secure payment
                          page to complete your payment
                        </div>
                        <p
                          className="text-[12px] leading-[18px] text-[#3E5460] font-normal"
                          style={TEXT_STYLES.bodyTeal}
                        >
                          Your payment information will be securely handled by
                          PAYable IPG. We accept Visa, Mastercard, American
                          Express, and other major cards.
                        </p>
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
                    {error && (
                      <div className="mx-auto w-full max-w-[460px] p-4 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

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

                    <button
                      type="submit"
                      disabled={!termsAccepted || processing || paymentLoading}
                      className={`w-full max-w-[460px] mx-auto h-[50px] bg-[#232D35] border border-[#232D35] flex items-center justify-center transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${termsAccepted && !processing && !paymentLoading ? "hover:opacity-90" : ""}`}
                    >
                      <span
                        className="text-[14px] md:text-[16px] font-medium text-[#E5E0D6] uppercase tracking-[2px] md:tracking-[4px] leading-[24px]"
                        style={TEXT_STYLES.button}
                      >
                        {processing || paymentLoading
                          ? "PROCESSING..."
                          : "CONFIRM AND COMPLETE PURCHASE"}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

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
