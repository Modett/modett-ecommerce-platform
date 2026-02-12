"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AddressSection } from "@/features/account/components/addresses/address-section";
import { BackToAccountLink } from "@/features/account/components/shared/back-to-account-link";
import { AccountSidebar } from "@/features/account/components/shared/account-sidebar";
import { getAddresses, createAddress } from "@/features/account/api";
import {
  AddressData,
  PHONE_PREFIXES,
} from "@/features/account/components/addresses/address-form";
import { useToast } from "@/components/ui/use-toast";

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch addresses
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast({
        title: "Success",
        description: "Address added successfully",
      });
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const deliveryAddresses = addresses
    .filter((addr: any) => addr.type === "shipping" || addr.type === "delivery")
    .map(transformBackendAddress);
  const billingAddresses = addresses
    .filter((addr: any) => addr.type === "billing")
    .map(transformBackendAddress);

  const handleSaveDelivery = async (data: AddressData) => {
    setIsSubmitting(true);
    // Transform frontend data to backend format
    const backendData = {
      type: "shipping",
      firstName: data.firstName,
      lastName: data.lastName,
      addressLine1: data.address, // Correct mapping
      addressLine2: data.building,
      city: data.city,
      state: data.province || "", // Map frontend 'province' to backend 'state'
      postalCode: data.postCode,
      country: data.country || "Sri Lanka",
      phone: `${data.phonePrefix} ${data.phoneNumber}`.replace(/[^0-9+]/g, ""), // Sanitize phone number
      isDefault: data.isDefault,
    };

    createMutation.mutate(backendData);
  };

  const handleSaveBilling = async (data: AddressData) => {
    setIsSubmitting(true);
    const backendData = {
      type: "billing",
      firstName: data.firstName,
      lastName: data.lastName,
      addressLine1: data.address,
      addressLine2: data.building,
      city: data.city,
      state: data.province || "", // Map frontend 'province' to backend 'state'
      postalCode: data.postCode,
      country: data.country || "Sri Lanka",
      phone: `${data.phonePrefix} ${data.phoneNumber}`.replace(/[^0-9+]/g, ""), // Sanitize phone number
      isDefault: data.isDefault,
    };

    createMutation.mutate(backendData);
  };

  return (
    <div className="w-full min-h-screen bg-[#EFECE5]">
      {/* Top Strip - Back Link */}
      <div className="w-full flex justify-center border-t border-b border-[#C3B0A5]/30">
        <div className="w-full max-w-[1440px] px-4 md:px-[60px] py-[32px]">
          <BackToAccountLink />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[60px] pt-[56px] pb-20">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-12">
          {/* Left Sidebar */}
          <AccountSidebar />

          {/* Right Content */}
          <div className="flex-1 max-w-[745px]">
            <h1
              className="text-[24px] font-normal text-[#765C4D] mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Address Book
            </h1>
            <p className="text-[#8B7355] text-sm mb-8">
              Manage your shipping and billing addresses
            </p>

            {isLoading ? (
              <div className="space-y-8">
                <div className="bg-[#F8F5F2] pt-[40px] px-[24px] pb-[32px]">
                  <h3
                    className="text-[18px] leading-[26px] font-normal text-[#765C4D] mb-3"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Delivery Addresses
                  </h3>
                  <div className="space-y-4 mb-6">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="border-b border-[#BBA496]/30 pb-4 last:border-0"
                      >
                        <div className="h-4 w-1/3 bg-[#E5E0D6] animate-pulse rounded mb-2" />
                        <div className="h-3 w-2/3 bg-[#E5E0D6] animate-pulse rounded mb-1" />
                        <div className="h-3 w-1/2 bg-[#E5E0D6] animate-pulse rounded mb-1" />
                        <div className="h-3 w-1/4 bg-[#E5E0D6] animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F8F5F2] pt-[40px] px-[24px] pb-[32px]">
                  <h3
                    className="text-[18px] leading-[26px] font-normal text-[#765C4D] mb-3"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Billing Addresses
                  </h3>
                  <div className="space-y-4 mb-6">
                    {[1].map((i) => (
                      <div
                        key={i}
                        className="border-b border-[#BBA496]/30 pb-4 last:border-0"
                      >
                        <div className="h-4 w-1/3 bg-[#E5E0D6] animate-pulse rounded mb-2" />
                        <div className="h-3 w-2/3 bg-[#E5E0D6] animate-pulse rounded mb-1" />
                        <div className="h-3 w-1/2 bg-[#E5E0D6] animate-pulse rounded mb-1" />
                        <div className="h-3 w-1/4 bg-[#E5E0D6] animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <AddressSection
                  type="delivery"
                  title="Delivery Addresses"
                  addresses={deliveryAddresses}
                  onSave={handleSaveDelivery}
                  isSubmitting={isSubmitting}
                />

                <AddressSection
                  type="billing"
                  title="Billing Addresses"
                  addresses={billingAddresses}
                  onSave={handleSaveBilling}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to transform backend address format to frontend AddressData
function transformBackendAddress(backendAddr: any): AddressData {
  let phonePrefix = "+94 LK";
  let phoneNumber = backendAddr.phone || "";

  for (const prefixOption of PHONE_PREFIXES) {
    const numericPrefix = prefixOption.value.split(" ")[0]; // e.g. "+94"
    if (phoneNumber.startsWith(numericPrefix)) {
      phonePrefix = prefixOption.value;
      phoneNumber = phoneNumber.slice(numericPrefix.length);
      break;
    }
  }

  // Fallback for legacy space-separated format if any
  if (
    phoneNumber.includes(" ") &&
    phoneNumber.startsWith("+") &&
    phonePrefix === "+94 LK"
  ) {
    const parts = phoneNumber.split(" ");
    if (parts.length >= 2) {
      phonePrefix =
        parts[0] + " " + (parts[1].match(/^[A-Z]{2}$/) ? parts[1] : "");
      // Re-join rest as number
      phoneNumber = parts.slice(phonePrefix.split(" ").length).join(" ");
    }
  }

  return {
    id: backendAddr.addressId || backendAddr.id, // Handle potential id field difference
    firstName: backendAddr.firstName || "",
    lastName: backendAddr.lastName || "",
    address: backendAddr.addressLine1 || "",
    building: backendAddr.addressLine2 || "",
    city: backendAddr.city || "",
    postCode: backendAddr.postalCode || "",
    province: backendAddr.state || "", // Map backend 'state' to frontend 'province'
    country: backendAddr.country || "Sri Lanka",
    phonePrefix: phonePrefix, // Default or parsed
    phoneNumber: phoneNumber,
    isDefault: backendAddr.isDefault || false,
  };
}
