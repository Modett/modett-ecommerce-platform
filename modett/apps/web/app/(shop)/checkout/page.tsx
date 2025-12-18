"use client";

import { useState, useEffect } from "react";
import {
  TEXT_STYLES,
  COMMON_CLASSES,
  RESPONSIVE,
} from "@/features/cart/constants/styles";
import { useCart, useUpdateCartEmail } from "@/features/cart/queries";
import { getStoredCartId } from "@/features/cart/utils";
import { CheckoutProgressBar } from "@/features/checkout/components/checkout-progress-bar";
import { CartSummary } from "@/features/checkout/components/cart-summary";
import { CheckoutHelpSection } from "@/features/checkout/components/checkout-help-section";
import { ActiveStepHeader } from "@/features/checkout/components/active-step-header";
import { CompletedCheckoutStep } from "@/features/checkout/components/completed-checkout-step";
import { LoadingState } from "@/features/checkout/components/loading-state";
import { FutureStep } from "@/features/checkout/components/future-step";
import { useRouter } from "next/navigation";

export default function CheckoutEmailPage() {
  const [email, setEmail] = useState("");
  const [cartId, setCartId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedCartId = getStoredCartId();
    if (storedCartId) {
      setCartId(storedCartId);
    }
  }, []);

  const { data: cart, isLoading } = useCart(cartId);
  const updateEmailMutation = useUpdateCartEmail();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !cartId) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setError(null);

      // Save email to cart in database
      await updateEmailMutation.mutateAsync({
        cartId,
        email,
      });

      // Also save to sessionStorage for backward compatibility
      sessionStorage.setItem("checkout_email", email);

      // Navigate to shipping page
      router.push("/checkout/shipping");
    } catch (err) {
      setError("Failed to save email. Please try again.");
    }
  };

  if (isLoading) {
    return <LoadingState />;
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
              <ActiveStepHeader stepNumber={1} title="E-mail address" />

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
                      disabled={updateEmailMutation.isPending}
                      className="w-full h-[42px] px-4 border border-[#BBA496] bg-[#F4F1EB] focus:outline-none focus:border-gray-400 disabled:opacity-50"
                      style={TEXT_STYLES.bodyGraphite}
                    />
                    {error && (
                      <p className="text-red-600 text-sm mt-2">{error}</p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={updateEmailMutation.isPending}
                      className="w-[300px] h-[50px] bg-[#232D35] border border-[#232D35] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span
                        className="text-sm font-medium text-white uppercase tracking-[3px]"
                        style={{ fontFamily: "Reddit Sans, sans-serif" }}
                      >
                        {updateEmailMutation.isPending
                          ? "SAVING..."
                          : "CONTINUE"}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Future Steps */}
            <FutureStep stepNumber={2} title="Shipping" />
            <FutureStep stepNumber={3} title="Information" />
            <FutureStep stepNumber={4} title="Payment" />

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
