"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddressForm, AddressData } from "./address-form";
import { FORM_CLASSES, FORM_FONT } from "../../constants/styles";

interface AddressSectionProps {
  type: "delivery" | "billing";
  title: string;
  addresses: AddressData[];
  onSave: (data: AddressData) => void;
  isSubmitting?: boolean;
}

export const AddressSection = ({
  type,
  title,
  addresses,
  onSave,
  isSubmitting = false,
}: AddressSectionProps) => {
  const [showForm, setShowForm] = useState(false);

  const handleSave = (data: AddressData) => {
    onSave(data);
    setShowForm(false);
  };

  return (
    <div className="bg-[#F8F5F2] pt-[40px] px-[24px] pb-[32px]">
      <h3
        className="text-[18px] leading-[26px] font-normal text-[#765C4D] mb-3"
        style={FORM_FONT}
      >
        {title}
      </h3>

      {addresses.length === 0 && (
        <p className={FORM_CLASSES.sectionDesc + " mb-6"} style={FORM_FONT}>
          You do not have any {type} addresses yet.
        </p>
      )}

      {/* Existing Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-4 mb-6">
          {addresses.map((addr, idx) => (
            <div
              key={idx}
              className="border-b border-[#BBA496]/30 pb-4 last:border-0"
            >
              <p className="text-[13px] text-[#765C4D]" style={FORM_FONT}>
                {addr.title} {addr.firstName} {addr.lastName}
              </p>
              <p className="text-[13px] text-[#765C4D]/70" style={FORM_FONT}>
                {addr.address}
                {addr.building ? `, ${addr.building}` : ""}
              </p>
              <p className="text-[13px] text-[#765C4D]/70" style={FORM_FONT}>
                {addr.city}
                {addr.province ? `, ${addr.province}` : ""} {addr.postCode}
              </p>
              <p className="text-[13px] text-[#765C4D]/70" style={FORM_FONT}>
                {addr.country}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Button */}
      {!showForm && (
        <Button
          type="button"
          onClick={() => setShowForm(true)}
          className={FORM_CLASSES.submitBtn}
        >
          ENTER NEW {type.toUpperCase()} ADDRESS
        </Button>
      )}

      {/* Address Form (expandable) */}
      {showForm && (
        <AddressForm
          type={type}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
