"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../../api";
import { ChangeEmailForm } from "./change-email-form";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccountModal } from "./delete-account-modal";
import { FORM_FONT } from "../../constants/styles";

export const LoginDetailsForm = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
  });

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-12">
        <h2
          className="text-[20px] leading-[28px] font-normal text-[#765C4D] mb-6"
          style={FORM_FONT}
        >
          Login Details
        </h2>
        <p
          className="text-[14px] leading-[24px] font-normal text-[#765C4D]"
          style={FORM_FONT}
        >
          {userProfile?.title ? `${userProfile.title} ` : ""}
          {userProfile?.firstName || "User"}, your login details are as follows.
        </p>
      </div>

      {/* Required fields note */}
      <div className="flex justify-end mb-4">
        <span
          className="text-[12px] leading-[18px] font-normal text-[#765C4D]"
          style={FORM_FONT}
        >
          * Required fields
        </span>
      </div>

      {/* Change Email Section */}
      <div className="mb-10">
        <ChangeEmailForm currentEmail={userProfile?.email || ""} />
      </div>

      {/* Change Password Section */}
      <div className="mb-10">
        <ChangePasswordForm />
      </div>

      {/* Delete Account */}
      <div className="flex justify-center pt-4 pb-8">
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="text-[13px] text-[#C78869] underline underline-offset-4 hover:text-[#a0664b] transition-colors"
          style={FORM_FONT}
        >
          Delete account
        </button>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
