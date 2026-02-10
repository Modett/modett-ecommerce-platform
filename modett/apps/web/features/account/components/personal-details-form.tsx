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
import { ACCOUNT_COLORS } from "../constants/styles";
import { COUNTRIES, TITLES } from "../constants/form-options";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile } from "../api";
import { toast } from "sonner";
import { useEffect } from "react";

export const PersonalDetailsForm = () => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  // Array of days 1-31
  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );
  // Array of months 1-12
  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );
  // Array of years (e.g., last 100 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  const queryClient = useQueryClient();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      toast.success("Personal details updated successfully");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update personal details");
    },
  });

  // Set default values when profile loads
  useEffect(() => {
    if (userProfile) {
      reset({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
      });

      // Set title if available
      if (userProfile.title) {
        setValue("title", userProfile.title);
      }

      // Set resident of if available
      if (userProfile.residentOf) {
        setValue("residentOf", userProfile.residentOf);
      }

      // Set nationality if available
      if (userProfile.nationality) {
        setValue("nationality", userProfile.nationality);
      }

      // Parse and set date of birth if available
      if (userProfile.dateOfBirth) {
        const date = new Date(userProfile.dateOfBirth);
        setValue("dobDay", String(date.getDate()).padStart(2, "0"));
        setValue("dobMonth", String(date.getMonth() + 1).padStart(2, "0"));
        setValue("dobYear", String(date.getFullYear()));
      }
    }
  }, [userProfile, reset, setValue]);

  const onSubmit = (data: any) => {
    // Construct date of birth from DD/MM/YYYY if all parts are present
    let dateOfBirth: string | undefined;
    if (data.dobDay && data.dobMonth && data.dobYear) {
      dateOfBirth = `${data.dobYear}-${data.dobMonth}-${data.dobDay}`;
    }

    updateProfileMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      title: data.title,
      dateOfBirth,
      residentOf: data.residentOf,
      nationality: data.nationality,
    });
  };

  return (
    <div className="w-full">
      <div className="mb-12">
        <h2
          className="text-[20px] leading-[28px] font-normal text-[#765C4D] mb-6"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          Personal Details
        </h2>
        <p
          className="text-[14px] leading-[24px] font-normal text-[#765C4D]"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          Mr. Name update your account preferences below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-end">
          <span
            className="text-[12px] leading-[18px] font-normal text-[#765C4D]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            * Required fields
          </span>
        </div>

        <div className="bg-[#F8F5F2] pt-[56px] px-[24px] pb-[32px] space-y-8">
          {/* Title */}
          <div className="space-y-0">
            <label
              className="text-[10px] leading-[16px] font-semibold text-[#765C4D] tracking-[1.03px] block"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              * Title:
            </label>
            <Select
              value={watch("title")}
              onValueChange={(value) => setValue("title", value)}
            >
              <SelectTrigger className="w-full h-[34px] border-0 border-b border-[#BBA496] rounded-none px-2 bg-transparent text-[#765C4D] focus:ring-0 focus:border-[#765C4D]">
                <SelectValue placeholder="Select title..." />
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

          {/* Name Fields Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-0">
              <label
                className="text-[10px] leading-[16px] font-semibold text-[#765C4D] tracking-[1.03px] block"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                * First name:
              </label>
              <Input
                className="h-[34px] border-0 border-b border-[#BBA496] rounded-none px-2 bg-transparent text-[#765C4D] focus-visible:ring-0 focus-visible:border-[#765C4D] placeholder:text-[#765C4D]/50"
                placeholder="Name"
                {...register("firstName")}
              />
            </div>
            <div className="space-y-0">
              <label
                className="text-[10px] leading-[16px] font-semibold text-[#765C4D] tracking-[1.03px] block"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                * Surname:
              </label>
              <Input
                className="h-[34px] border-0 border-b border-[#BBA496] rounded-none px-2 bg-transparent text-[#765C4D] focus-visible:ring-0 focus-visible:border-[#765C4D] placeholder:text-[#765C4D]/50"
                placeholder="Name"
                {...register("lastName")}
              />
            </div>
          </div>

          {/* Resident of */}
          <div className="space-y-0">
            <label
              className="text-[10px] leading-[16px] font-semibold text-[#765C4D] tracking-[1.03px] block"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Resident of:
            </label>
            <Select
              value={watch("residentOf")}
              onValueChange={(value) => setValue("residentOf", value)}
            >
              <SelectTrigger className="w-full h-[34px] border-0 border-b border-[#BBA496] rounded-none px-2 bg-transparent text-[#765C4D] focus:ring-0 focus:border-[#765C4D]">
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

          {/* Date of Birth */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-0">
              <label className="text-[10px] text-[#765C4D] uppercase font-bold block">
                DD
              </label>
              <Select
                value={watch("dobDay")}
                onValueChange={(value) => setValue("dobDay", value)}
              >
                <SelectTrigger className="w-full h-[34px] border-0 border-b border-[#BBA496] rounded-none px-2 bg-transparent text-[#765C4D] focus:ring-0 focus:border-[#765C4D]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-0">
              <label className="text-[10px] text-[#765C4D] uppercase font-bold block">
                MM
              </label>
              <Select
                value={watch("dobMonth")}
                onValueChange={(value) => setValue("dobMonth", value)}
              >
                <SelectTrigger className="w-full h-[34px] border-0 border-b border-[#BBA496] rounded-none px-2 bg-transparent text-[#765C4D] focus:ring-0 focus:border-[#765C4D]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-0">
              <label className="text-[10px] text-[#765C4D] uppercase font-bold block">
                YYYY
              </label>
              <Select
                value={watch("dobYear")}
                onValueChange={(value) => setValue("dobYear", value)}
              >
                <SelectTrigger className="w-full h-[34px] border-0 border-b border-[#BBA496] rounded-none px-2 bg-transparent text-[#765C4D] focus:ring-0 focus:border-[#765C4D]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nationality/Passport */}
          <div className="space-y-0">
            <label
              className="text-[10px] leading-[16px] font-semibold text-[#765C4D] tracking-[1.03px] block"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Nationality/Passport:
            </label>
            <Select
              value={watch("nationality")}
              onValueChange={(value) => setValue("nationality", value)}
            >
              <SelectTrigger className="w-full h-[34px] border-0 border-b border-[#BBA496] rounded-none px-2 bg-transparent text-[#765C4D] focus:ring-0 focus:border-[#765C4D]">
                <SelectValue placeholder="Select nationality..." />
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

          {/* Submit Button */}
          <div className="pt-8">
            <Button
              type="submit"
              className="w-full h-[48px] bg-[#F5F3EF] border border-[#C0B8A9] text-[#765C4D] hover:bg-[#D3CDC1] hover:text-[#765C4D] uppercase tracking-[2px] text-[12px] font-medium"
            >
              SAVE DETAILS
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
