"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X, Eye, EyeOff } from "lucide-react";
import { changePassword } from "../../api";
import { FORM_CLASSES, FORM_FONT } from "../../constants/styles";

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePasswordForm = () => {
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const { register, handleSubmit, watch, reset } =
    useForm<ChangePasswordData>();

  const newPwd = watch("newPassword") || "";
  const hasMinLength = newPwd.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPwd);
  const hasLowerCase = /[a-z]/.test(newPwd);

  const requirements = [
    { label: "Minimum 8 characters", met: hasMinLength },
    { label: "At least 1 capital letter", met: hasUpperCase },
    { label: "At least 1 lower letter", met: hasLowerCase },
  ];

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      toast.success(data.message || "Password updated successfully");
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update password");
    },
  });

  const onSubmit = (data: ChangePasswordData) => {
    if (!hasMinLength || !hasUpperCase || !hasLowerCase) {
      toast.error("Password does not meet the requirements");
      return;
    }

    const passwordData = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.newPassword,
    };

    changePasswordMutation.mutate(passwordData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={FORM_CLASSES.sectionCard}>
        {/* Section Header */}
        <div>
          <h3 className={FORM_CLASSES.sectionTitle} style={FORM_FONT}>
            Change password:
          </h3>
          <p className={FORM_CLASSES.sectionDesc} style={FORM_FONT}>
            Enter your new password and current to update password.
          </p>
        </div>

        {/* Current Password */}
        <div className="space-y-0">
          <label className={FORM_CLASSES.label} style={FORM_FONT}>
            * Current password:
          </label>
          <div className="relative">
            <Input
              className={FORM_CLASSES.input}
              type={showCurrentPwd ? "text" : "password"}
              {...register("currentPassword", { required: true })}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPwd(!showCurrentPwd)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#765C4D]/60 hover:text-[#765C4D] transition-colors"
            >
              {showCurrentPwd ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-0">
          <label className={FORM_CLASSES.label} style={FORM_FONT}>
            * New Password:
          </label>
          <div className="relative">
            <Input
              className={FORM_CLASSES.input}
              type={showNewPwd ? "text" : "password"}
              {...register("newPassword", { required: true })}
            />
            <button
              type="button"
              onClick={() => setShowNewPwd(!showNewPwd)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#765C4D]/60 hover:text-[#765C4D] transition-colors"
            >
              {showNewPwd ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Password Requirements (inline) */}
        <div className="space-y-2 pl-1">
          <p
            className="text-[12px] leading-[18px] font-normal text-[#765C4D]"
            style={FORM_FONT}
          >
            The password should contain:
          </p>
          <ul className="space-y-1 pl-4">
            {requirements.map((req) => (
              <li key={req.label} className="flex items-center gap-2">
                {req.met ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <X className="w-3 h-3 text-[#765C4D]/40" />
                )}
                <span
                  className={`text-[12px] ${req.met ? "text-green-700" : "text-[#765C4D]/70"}`}
                  style={FORM_FONT}
                >
                  {req.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button
            type="submit"
            className={FORM_CLASSES.submitBtn}
            disabled={changePasswordMutation.isPending}
          >
            UPDATE PASSWORD
          </Button>
        </div>
      </div>
    </form>
  );
};
