"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { PaymentMethodOption } from "@/features/checkout/components/payment-method-option";
import { PaymentGatewayInfo } from "@/features/checkout/components/payment-gateway-info";
import { usePayableIPG } from "@/features/checkout/hooks/use-payable-ipg";
import { Alert } from "@/components/ui/alert";
import { handleError } from "@/lib/error-handler";
import * as cartApi from "@/features/cart/api";
import { useTrackAddPaymentInfo } from "@/features/analytics/hooks/use-analytics-tracking";

export default function CheckoutPaymentPage() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cards");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const router = useRouter();

  const trackAddPaymentInfo = useTrackAddPaymentInfo();

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
          const detailedCheckout = await cartApi.getCheckout(
            checkout.checkoutId
          );
          if (
            detailedCheckout.status === "completed" ||
            detailedCheckout.status === "paid"
          ) {
            console.warn(
              "[Checkout] Detected completed checkout session, redirecting to success"
            );
            clearCartData();
            window.location.href = `/checkout/success?checkoutId=${checkout.checkoutId}`;
            return;
          }
        } catch (detailErr) {
          handleError(detailErr, "Fetch checkout status");
        }
      } catch (err: unknown) {
        const errorMessage = handleError(err, "Initialize checkout");

        // If cart has a completed order, clear cart data and redirect to cart page
        if (errorMessage.includes("completed order")) {
          console.warn(
            "[Checkout] Cart has completed order, clearing cart data"
          );
          clearCartData();
          setError(
            "Your previous order is complete. Please add items to your cart to place a new order."
          );
          setTimeout(() => {
            window.location.href = "/cart";
          }, 2000);
        } else {
          setError(errorMessage);
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
      const customerName =
        `${cart.shippingFirstName || ""} ${cart.shippingLastName || ""}`.trim();

      // Track analytics event
      if (cart && cart.summary) {
        await trackAddPaymentInfo.mutateAsync({
          cartId: cartId,
          paymentMethod: paymentMethod,
          cartTotal: cart.summary.total,
          itemCount: cart.summary.itemCount,
          currency: "LKR",
        });
      }

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
      const errorMessage = handleError(err, "Payment initialization");
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
                    <div className="rounded-[8px] overflow-hidden">
                      <PaymentMethodOption
                        value="cards"
                        label="Cards"
                        isSelected={paymentMethod === "cards"}
                        onSelect={setPaymentMethod}
                        icons={[
                          {
                            src: "/images/payment/visa.png",
                            alt: "Visa",
                            width: 58,
                            height: 40,
                          },
                          {
                            src: "/images/payment/mastercard.png",
                            alt: "Mastercard",
                            width: 58,
                            height: 40,
                          },
                        ]}
                      />
                    </div>

                    {/* Payment Gateway Info */}
                    {paymentMethod === "cards" && <PaymentGatewayInfo />}

                    {/* Mintpay */}
                    <PaymentMethodOption
                      value="mintpay"
                      label="Mintpay"
                      isSelected={paymentMethod === "mintpay"}
                      onSelect={setPaymentMethod}
                      icon="/images/payment/mintpay.png"
                    />

                    {/* Koko */}
                    <PaymentMethodOption
                      value="koko"
                      label="Koko"
                      isSelected={paymentMethod === "koko"}
                      onSelect={setPaymentMethod}
                      icon="/images/payment/koko.png"
                    />

                    {/* American Express */}
                    <PaymentMethodOption
                      value="amex"
                      label="American Express"
                      isSelected={paymentMethod === "amex"}
                      onSelect={setPaymentMethod}
                      icon="/images/payment/amex.png"
                    />
                  </div>

                  <div className="flex flex-col gap-[16px] w-full">
                    {error && (
                      <Alert
                        variant="error"
                        onClose={() => setError(null)}
                        className="mx-auto w-full max-w-[460px]"
                      >
                        {error}
                      </Alert>
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
