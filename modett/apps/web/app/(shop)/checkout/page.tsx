"use client";

import { useState } from "react";
import { TEXT_STYLES, COMMON_CLASSES } from "@/features/cart/constants/styles";
import { useCart } from "@/features/cart/queries";
import { useCartId } from "@/features/cart/hooks/use-cart-id";
import {
  CheckoutProgressBar,
  CartSummary,
  CheckoutHelpSection,
  ActiveStepHeader,
  CompletedCheckoutStep,
  LoadingState,
  FutureStep,
} from "@/features/checkout/components";
import { PageContainer } from "@/components/layout/page-container";
import { useRouter } from "next/navigation";

export default function CheckoutEmailPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const cartId = useCartId();
  const { data: cart, isLoading } = useCart(cartId);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Validate email and navigate to shipping page

    router.push("/checkout/shipping");
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <PageContainer fullHeight withBackground asMain className="py-8">
      <CheckoutProgressBar currentStep={1} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 min-h-[750px]">
        <div className="space-y-2">
          <div className={`${COMMON_CLASSES.pageBg} w-full max-w-[904px]`}>
            {/* Active Step Header */}
            <ActiveStepHeader stepNumber={1} title="E-mail address" />

            <div className="p-4 md:p-6 w-full max-w-[358px] md:max-w-none mx-auto md:mx-0 border border-[#E5E0D6] md:border-0 border-t-0">
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
          <FutureStep stepNumber={2} title="Shipping" />
          <FutureStep stepNumber={3} title="Information" />
          <FutureStep stepNumber={4} title="Payment" />

          <CheckoutHelpSection />
        </div>

        <div className="mt-[-80px]">
          <CartSummary cart={cart} />
        </div>
      </div>
    </PageContainer>
  );
}
