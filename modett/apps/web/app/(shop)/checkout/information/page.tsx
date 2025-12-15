"use client";

import { useState } from "react";
import { TEXT_STYLES, COMMON_CLASSES } from "@/features/cart/constants/styles";
import { PageContainer } from "@/components/layout/page-container";
import { useCart } from "@/features/cart/queries";
import { useCartId } from "@/features/cart/hooks/use-cart-id";
import {
  CheckoutProgressBar,
  CartSummary,
  CheckoutHelpSection,
  CompletedCheckoutStep,
  ActiveStepHeader,
  FutureStep,
  CheckoutButton,
  FormInput,
  CustomCheckbox,
  LoadingState,
} from "@/features/checkout/components";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CheckoutInformationPage() {
  const [title, setTitle] = useState("ms");
  const [sameAddress, setSameAddress] = useState(true);
  const email = "test@gmail.com";
  const router = useRouter();
  const cartId = useCartId();
  const { data: cart, isLoading } = useCart(cartId);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Validate form and save information

    router.push("/checkout/payment");
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <PageContainer
      fullHeight
      withBackground
      asMain
      className="py-4 md:py-6 lg:py-8"
    >
      <CheckoutProgressBar currentStep={3} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 md:gap-6 lg:gap-10 min-h-[750px]">
        <div className="space-y-6 max-w-[904px] pb-16">
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
              Colombo 1-15 shipping in 2-3 working days from order confirmation
            </p>
          </CompletedCheckoutStep>

          {/* Step 3: Information (Active) */}
          <div className={`${COMMON_CLASSES.pageBg} w-full max-w-[904px]`}>
            <ActiveStepHeader stepNumber={3} title="Information" />

            <div className="p-6 flex flex-col gap-2">
              <form onSubmit={handleContinue}>
                <div className="mb-6 md:mb-8">
                  <p
                    className="text-[16px] text-[#3E5460] font-medium leading-[20px] tracking-[0.02em]"
                    style={TEXT_STYLES.bodyTeal}
                  >
                    Where do you want your order to be shipped?
                  </p>

                  {/* Title Radio Buttons */}
                  <div className="mb-6">
                    <label
                      className="block text-[12px] text-[#232D35] mb-2 font-normal leading-[18px] tracking-[0px]"
                      style={TEXT_STYLES.bodyGraphite}
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
                            checked={title === t.toLowerCase().replace(".", "")}
                            onChange={() =>
                              setTitle(t.toLowerCase().replace(".", ""))
                            }
                            className="hidden"
                          />
                          <span
                            className="text-[12px] text-[#232D35] font-normal leading-[18px] tracking-[0px]"
                            style={TEXT_STYLES.bodyGraphite}
                          >
                            {t}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormInput
                      label="First Name *"
                      type="text"
                      containerClassName="pb-4 w-full"
                    />
                    <FormInput
                      label="Last Name *"
                      type="text"
                      containerClassName="pb-4 w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormInput
                      label="Phone *"
                      type="text"
                      labelClassName="text-[12px] text-[#3E5460]"
                      labelStyle={TEXT_STYLES.bodyTeal}
                    />
                    <FormInput
                      label="Address *"
                      type="text"
                      labelClassName="text-[12px] text-[#3E5460]"
                      labelStyle={TEXT_STYLES.bodyTeal}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <FormInput
                      label="City *"
                      type="text"
                      labelClassName="text-[12px] text-[#3E5460]"
                      labelStyle={TEXT_STYLES.bodyTeal}
                    />
                    <FormInput
                      label="ZIP Code *"
                      type="text"
                      labelClassName="text-[12px] text-[#3E5460]"
                      labelStyle={TEXT_STYLES.bodyTeal}
                    />
                    <FormInput
                      label="State *"
                      type="text"
                      labelClassName="text-[12px] text-[#3E5460]"
                      labelStyle={TEXT_STYLES.bodyTeal}
                    />
                  </div>

                  {/* Same Address Checkbox */}
                  <CustomCheckbox
                    label="The delivery address is the same as the invoice address"
                    checked={sameAddress}
                    onChange={(e) => setSameAddress(e.target.checked)}
                    containerClassName="mb-8"
                  />

                  {/* Continue Button */}
                  <div className="flex justify-center">
                    <CheckoutButton />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Step 4: Payment (Future) */}
          <FutureStep stepNumber={4} title="Payment" />

          {/* Footer Section */}
          <CheckoutHelpSection />
        </div>

        <div className="lg:mt-[-80px]">
          <CartSummary cart={cart} />
        </div>
      </div>
    </PageContainer>
  );
}
