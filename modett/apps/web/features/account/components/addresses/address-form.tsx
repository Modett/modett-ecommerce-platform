"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TITLES, COUNTRIES } from "../../constants/form-options";
import { FORM_CLASSES, FORM_FONT } from "../../constants/styles";

export const PHONE_PREFIXES = [
  { value: "+44 UK", label: "+44 UK" },
  { value: "+1 US", label: "+1 US" },
  { value: "+1 CA", label: "+1 CA" },
  { value: "+33 FR", label: "+33 FR" },
  { value: "+39 IT", label: "+39 IT" },
  { value: "+49 DE", label: "+49 DE" },
  { value: "+34 ES", label: "+34 ES" },
  { value: "+31 NL", label: "+31 NL" },
  { value: "+41 CH", label: "+41 CH" },
  { value: "+43 AT", label: "+43 AT" },
  { value: "+46 SE", label: "+46 SE" },
  { value: "+47 NO", label: "+47 NO" },
  { value: "+45 DK", label: "+45 DK" },
  { value: "+91 IN", label: "+91 IN" },
  { value: "+94 LK", label: "+94 LK" },
  { value: "+971 AE", label: "+971 AE" },
  { value: "+61 AU", label: "+61 AU" },
  { value: "+81 JP", label: "+81 JP" },
  { value: "+86 CN", label: "+86 CN" },
  { value: "+55 BR", label: "+55 BR" },
  { value: "+27 ZA", label: "+27 ZA" },
  { value: "+65 SG", label: "+65 SG" },
];

export interface AddressData {
  title?: string;
  firstName?: string;
  lastName?: string;
  phonePrefix?: string;
  phoneNumber: string; // Maps to 'phone' in backend
  address: string; // Maps to 'addressLine1' in backend
  building?: string; // Maps to 'addressLine2' in backend
  postCode?: string; // Maps to 'postalCode' in backend
  city: string;
  province?: string; // Maps to 'state' in backend
  country?: string;
  id?: string;
  isDefault?: boolean;
}

interface AddressFormProps {
  type: "delivery" | "billing";
  onSave: (data: AddressData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const AddressForm = ({
  type,
  onSave,
  onCancel,
  isSubmitting = false,
}: AddressFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<AddressData>({
    defaultValues: {
      phonePrefix: "+44 UK",
      country: "Italy",
    },
  });

  const onSubmit = (data: AddressData) => {
    onSave(data);
  };

  return (
    <div className="bg-[#F8F5F2] pt-[40px] px-[24px] pb-[32px] mt-6">
      {/* Form Header */}
      <div className="mb-6">
        <h4
          className="text-[16px] leading-[24px] font-normal text-[#765C4D] italic mb-1"
          style={FORM_FONT}
        >
          Enter new {type} address
        </h4>
      </div>

      {/* Required fields */}
      <div className="flex justify-end mb-6">
        <span
          className="text-[12px] leading-[18px] font-normal text-[#765C4D]"
          style={FORM_FONT}
        >
          * Required fields
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div className="space-y-0">
          <label className={FORM_CLASSES.label} style={FORM_FONT}>
            Title
          </label>
          <Select
            value={watch("title")}
            onValueChange={(value) => setValue("title", value)}
          >
            <SelectTrigger className={FORM_CLASSES.selectTrigger}>
              <SelectValue placeholder="Mr." />
            </SelectTrigger>
            <SelectContent>
              {TITLES.map((title) => (
                <SelectItem key={title} value={title}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* First Name & Last Name */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-0">
            <label className={FORM_CLASSES.label} style={FORM_FONT}>
              * First Name:
            </label>
            <Input
              className={FORM_CLASSES.input}
              placeholder="Name"
              {...register("firstName", { required: true })}
            />
          </div>
          <div className="space-y-0">
            <label className={FORM_CLASSES.label} style={FORM_FONT}>
              * Last Name:
            </label>
            <Input
              className={FORM_CLASSES.input}
              placeholder="Name"
              {...register("lastName", { required: true })}
            />
          </div>
        </div>

        {/* Phone Prefix & Phone Number */}
        <div className="grid grid-cols-[140px_1fr] gap-6">
          <div className="space-y-0">
            <label className={FORM_CLASSES.label} style={FORM_FONT}>
              * Prefix:
            </label>
            <Select
              value={watch("phonePrefix")}
              onValueChange={(value) => setValue("phonePrefix", value)}
            >
              <SelectTrigger
                className={`${FORM_CLASSES.selectTrigger} text-[12px]`}
              >
                <SelectValue placeholder="+44 UK" />
              </SelectTrigger>
              <SelectContent>
                {PHONE_PREFIXES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-0">
            <label className={FORM_CLASSES.label} style={FORM_FONT}>
              * Phone Number:
            </label>
            <Input
              className={FORM_CLASSES.input}
              type="tel"
              {...register("phoneNumber", { required: true })}
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-0">
          <label className={FORM_CLASSES.label} style={FORM_FONT}>
            * Address:
          </label>
          <Input
            className={FORM_CLASSES.input}
            {...register("address", { required: true })}
          />
        </div>

        {/* Building & Post code */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-0">
            <label className={FORM_CLASSES.label} style={FORM_FONT}>
              Building/Apartment/Villa:
            </label>
            <Input className={FORM_CLASSES.input} {...register("building")} />
          </div>
          <div className="space-y-0">
            <label className={FORM_CLASSES.label} style={FORM_FONT}>
              * Post code:
            </label>
            <Input
              className={FORM_CLASSES.input}
              {...register("postCode", { required: true })}
            />
          </div>
        </div>

        {/* City & Province/State */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-0">
            <label className={FORM_CLASSES.label} style={FORM_FONT}>
              * City:
            </label>
            <Input
              className={FORM_CLASSES.input}
              {...register("city", { required: true })}
            />
          </div>
          <div className="space-y-0">
            <label className={FORM_CLASSES.label} style={FORM_FONT}>
              * Province/State:
            </label>
            <Select
              value={watch("province")}
              onValueChange={(value) => setValue("province", value)}
            >
              <SelectTrigger className={FORM_CLASSES.selectTrigger}>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder">Select...</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Country/Region */}
        <div className="space-y-0">
          <label className={FORM_CLASSES.label} style={FORM_FONT}>
            * Country/Region:
          </label>
          <Select
            value={watch("country")}
            onValueChange={(value) => setValue("country", value)}
          >
            <SelectTrigger className={FORM_CLASSES.selectTrigger}>
              <SelectValue placeholder="Select country..." />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Buttons */}
        <div className="pt-6 space-y-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={FORM_CLASSES.saveBtn}
          >
            SAVE DETAILS
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            className={FORM_CLASSES.submitBtn}
          >
            CANCEL
          </Button>
        </div>
      </form>
    </div>
  );
};
