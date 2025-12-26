"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { TEXT_STYLES, COMMON_CLASSES } from "@/features/cart/constants/styles";
import { useCart, useUpdateCartAddresses } from "@/features/cart/queries";
import { getStoredCartId } from "@/features/cart/utils";
import { CheckoutProgressBar } from "@/features/checkout/components/checkout-progress-bar";
import { CartSummary } from "@/features/checkout/components/cart-summary";
import { CheckoutHelpSection } from "@/features/checkout/components/checkout-help-section";
import { CompletedCheckoutStep } from "@/features/checkout/components/completed-checkout-step";
import { ActiveStepHeader } from "@/features/checkout/components/active-step-header";
import { FutureStep } from "@/features/checkout/components/future-step";
import { FormInput } from "@/features/checkout/components/form-input";
import { CustomCheckbox } from "@/features/checkout/components/custom-checkbox";
import { LoadingState } from "@/features/checkout/components/loading-state";
import { DEFAULT_COUNTRY } from "@/constants/countries";
import { Alert } from "@/components/ui/alert";
import { handleError } from "@/lib/error-handler";

export default function CheckoutInformationPage() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [title, setTitle] = useState("ms");
  const [sameAddress, setSameAddress] = useState(true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Shipping address form state
  const [shippingFirstName, setShippingFirstName] = useState("");
  const [shippingLastName, setShippingLastName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress1, setShippingAddress1] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingProvince, setShippingProvince] = useState("");

  const router = useRouter();
  const updateAddressesMutation = useUpdateCartAddresses();

  useEffect(() => {
    const storedCartId = getStoredCartId();
    if (storedCartId) {
      setCartId(storedCartId);
    }
  }, []);

  const { data: cart, isLoading } = useCart(cartId);

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

    // Load saved address data from cart if available
    if (cart) {
      if (cart.shippingFirstName) setShippingFirstName(cart.shippingFirstName);
      if (cart.shippingLastName) setShippingLastName(cart.shippingLastName);
      if (cart.shippingPhone) setShippingPhone(cart.shippingPhone);
      if (cart.shippingAddress1) setShippingAddress1(cart.shippingAddress1);
      if (cart.shippingCity) setShippingCity(cart.shippingCity);
      if (cart.shippingPostalCode)
        setShippingPostalCode(cart.shippingPostalCode);
      if (cart.shippingProvince) setShippingProvince(cart.shippingProvince);
      if (cart.sameAddressForBilling !== undefined) {
        setSameAddress(cart.sameAddressForBilling);
      }
    }
  }, [cart]);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cartId) {
      setError("Cart not found");
      return;
    }

    // Validate required fields
    if (
      !shippingFirstName ||
      !shippingLastName ||
      !shippingPhone ||
      !shippingAddress1 ||
      !shippingCity ||
      !shippingPostalCode ||
      !shippingProvince
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setError(null);

      await updateAddressesMutation.mutateAsync({
        cartId,
        addressData: {
          shippingFirstName,
          shippingLastName,
          shippingPhone,
          shippingAddress1,
          shippingCity,
          shippingPostalCode,
          shippingProvince,
          shippingCountryCode: DEFAULT_COUNTRY.code,
          sameAddressForBilling: sameAddress,
          ...(sameAddress && {
            billingFirstName: shippingFirstName,
            billingLastName: shippingLastName,
            billingPhone: shippingPhone,
            billingAddress1: shippingAddress1,
            billingCity: shippingCity,
            billingPostalCode: shippingPostalCode,
            billingProvince: shippingProvince,
            billingCountryCode: DEFAULT_COUNTRY.code,
          }),
        },
      });

      router.push("/checkout/payment");
    } catch (error: unknown) {
      const errorMessage = handleError(error, "Save address information");
      setError(errorMessage);
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
        <CheckoutProgressBar currentStep={3} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 md:gap-6 lg:gap-10 min-h-[750px]">
          <div className="space-y-6 max-w-[904px] pb-16">
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
                Colombo 1-15 shipping in 2-3 working days from order
                confirmation
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

                    {/* Error Message */}
                    {error && (
                      <Alert
                        variant="error"
                        onClose={() => setError(null)}
                        className="mt-4"
                      >
                        {error}
                      </Alert>
                    )}

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
                        value={shippingFirstName}
                        onChange={(e) => setShippingFirstName(e.target.value)}
                        containerClassName="pb-4 w-full"
                      />
                      <FormInput
                        label="Last Name *"
                        type="text"
                        value={shippingLastName}
                        onChange={(e) => setShippingLastName(e.target.value)}
                        containerClassName="pb-4 w-full"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FormInput
                        label="Phone *"
                        type="text"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        labelClassName="text-[12px] text-[#3E5460]"
                        labelStyle={TEXT_STYLES.bodyTeal}
                      />
                      <FormInput
                        label="Address *"
                        type="text"
                        value={shippingAddress1}
                        onChange={(e) => setShippingAddress1(e.target.value)}
                        labelClassName="text-[12px] text-[#3E5460]"
                        labelStyle={TEXT_STYLES.bodyTeal}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <FormInput
                        label="City *"
                        type="text"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        labelClassName="text-[12px] text-[#3E5460]"
                        labelStyle={TEXT_STYLES.bodyTeal}
                      />
                      <FormInput
                        label="ZIP Code *"
                        type="text"
                        value={shippingPostalCode}
                        onChange={(e) => setShippingPostalCode(e.target.value)}
                        labelClassName="text-[12px] text-[#3E5460]"
                        labelStyle={TEXT_STYLES.bodyTeal}
                      />
                      <FormInput
                        label="State *"
                        type="text"
                        value={shippingProvince}
                        onChange={(e) => setShippingProvince(e.target.value)}
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
                      <button
                        type="submit"
                        disabled={updateAddressesMutation.isPending}
                        className={`w-full md:w-[280px] lg:w-[300px] h-[44px] md:h-[48px] lg:h-[50px] bg-[#232D35] border border-[#232D35] px-6 md:px-8 lg:px-[31px] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span
                          className="text-sm md:text-[15px] lg:text-[16px] font-medium text-[#E5E0D6] uppercase tracking-[2px] md:tracking-[3px] lg:tracking-[4px] leading-[20px] md:leading-[22px] lg:leading-[24px]"
                          style={TEXT_STYLES.button}
                        >
                          {updateAddressesMutation.isPending
                            ? "SAVING..."
                            : "CONTINUE"}
                        </span>
                      </button>
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
      </div>
    </main>
  );
}
