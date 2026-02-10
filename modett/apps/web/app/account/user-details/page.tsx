"use client";

import { AccountSidebar } from "@/features/account/components/shared/account-sidebar";
import { BackToAccountLink } from "@/features/account/components/shared/back-to-account-link";
import { LoginDetailsForm } from "@/features/account/components/user-details/login-details-form";

export default function UserDetailsPage() {
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
            <LoginDetailsForm />
          </div>
        </div>
      </div>
    </div>
  );
}
