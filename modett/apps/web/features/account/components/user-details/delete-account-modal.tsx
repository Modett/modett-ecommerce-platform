"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteAccount } from "../../api";
import { useRouter } from "next/navigation";
import { FORM_CLASSES, FORM_FONT } from "../../constants/styles";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeleteAccountForm {
  password: string;
  confirmation: string;
}

export const DeleteAccountModal = ({
  isOpen,
  onClose,
}: DeleteAccountModalProps) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm<DeleteAccountForm>();

  const deleteAccountMutation = useMutation({
    mutationFn: async (password: string) => deleteAccount(password),
    onSuccess: () => {
      toast.success("Account deleted successfully");
      localStorage.removeItem("authToken");
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete account");
    },
  });

  const onSubmit = (data: DeleteAccountForm) => {
    if (data.confirmation !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    if (!data.password) {
      toast.error("Password is required");
      return;
    }

    deleteAccountMutation.mutate(data.password);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#F8F5F2] border-[#BBA496] max-w-md">
        <DialogHeader>
          <DialogTitle
            className="text-[20px] leading-[28px] font-normal text-[#765C4D] flex items-center gap-2"
            style={FORM_FONT}
          >
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Delete Account
          </DialogTitle>
          <DialogDescription
            className="text-[14px] leading-[22px] font-normal text-[#765C4D]/80"
            style={FORM_FONT}
          >
            This action cannot be undone. This will permanently delete your
            account and remove all your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p
              className="text-[12px] leading-[18px] font-normal text-red-800"
              style={FORM_FONT}
            >
              ⚠️ Warning: Deleting your account will:
            </p>
            <ul
              className="mt-2 ml-4 text-[12px] leading-[18px] text-red-800 list-disc space-y-1"
              style={FORM_FONT}
            >
              <li>Remove all your personal data</li>
              <li>Cancel all active orders</li>
              <li>Delete your order history</li>
              <li>Remove saved addresses and payment methods</li>
            </ul>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-0">
            <label className={FORM_CLASSES.label} style={FORM_FONT}>
              * Type "DELETE" to confirm:
            </label>
            <Input
              className={FORM_CLASSES.input}
              placeholder="DELETE"
              {...register("confirmation", { required: true })}
            />
          </div>

          {/* Password Input */}
          <div className="space-y-0">
            <label className={FORM_CLASSES.label} style={FORM_FONT}>
              * Enter your password:
            </label>
            <div className="relative">
              <Input
                className={FORM_CLASSES.input}
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                {...register("password", { required: true })}
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

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={handleClose}
              className="flex-1 h-[48px] bg-[#F5F3EF] border border-[#C0B8A9] text-[#765C4D] hover:bg-[#D3CDC1] uppercase tracking-[2px] text-[12px] font-medium"
              disabled={deleteAccountMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-[48px] bg-red-600 border border-red-700 text-white hover:bg-red-700 uppercase tracking-[2px] text-[12px] font-medium"
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending
                ? "Deleting..."
                : "Delete Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
