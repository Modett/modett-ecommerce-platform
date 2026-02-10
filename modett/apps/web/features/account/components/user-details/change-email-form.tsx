"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { changeEmail } from "../../api";
import { FORM_CLASSES, FORM_FONT } from "../../constants/styles";

interface ChangeEmailFormProps {
  currentEmail: string;
}

interface ChangeEmailData {
  newEmail: string;
  confirmEmail: string;
  emailPassword: string;
}

export const ChangeEmailForm = ({ currentEmail }: ChangeEmailFormProps) => {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, reset } = useForm<ChangeEmailData>();

  const changeEmailMutation = useMutation({
    mutationFn: async (data: ChangeEmailData) => {
      return changeEmail({
        newEmail: data.newEmail,
        password: data.emailPassword,
      });
    },
    onSuccess: (data) => {
      toast.success(data.message || "Email updated successfully");
      reset();
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update email");
    },
  });

  const onSubmit = (data: ChangeEmailData) => {
    if (data.newEmail !== data.confirmEmail) {
      toast.error("Emails do not match");
      return;
    }
    changeEmailMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={FORM_CLASSES.sectionCard}>
        {/* Section Header */}
        <div>
          <h3 className={FORM_CLASSES.sectionTitle} style={FORM_FONT}>
            Change Email:
          </h3>
          <p className={FORM_CLASSES.sectionDesc} style={FORM_FONT}>
            Enter your new Email.
          </p>
        </div>

        {/* Current Email (readonly) */}
        <div className="space-y-0">
          <label className={FORM_CLASSES.label} style={FORM_FONT}>
            * Current Email:
          </label>
          <Input
            className={FORM_CLASSES.input}
            value={currentEmail}
            disabled
            readOnly
          />
        </div>

        {/* New Email */}
        <div className="space-y-0">
          <label className={FORM_CLASSES.label} style={FORM_FONT}>
            * New Email:
          </label>
          <Input
            className={FORM_CLASSES.input}
            type="email"
            {...register("newEmail", { required: true })}
          />
        </div>

        {/* Confirm new Email */}
        <div className="space-y-0">
          <label className={FORM_CLASSES.label} style={FORM_FONT}>
            * Confirm new Email:
          </label>
          <Input
            className={FORM_CLASSES.input}
            type="email"
            {...register("confirmEmail", { required: true })}
          />
        </div>

        {/* Current Password */}
        <div className="space-y-0">
          <label className={FORM_CLASSES.label} style={FORM_FONT}>
            * Current password:
          </label>
          <div className="relative">
            <Input
              className={FORM_CLASSES.input}
              type={showPassword ? "text" : "password"}
              {...register("emailPassword", { required: true })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#765C4D]/60 hover:text-[#765C4D] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button
            type="submit"
            className={FORM_CLASSES.submitBtn}
            disabled={changeEmailMutation.isPending}
          >
            UPDATE E-MAIL
          </Button>
        </div>
      </div>
    </form>
  );
};
