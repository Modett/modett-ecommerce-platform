"use client";

import { AccountSidebar } from "@/features/account/components/account-sidebar";
import { BackToAccountLink } from "@/features/account/components/back-to-account-link";
import { PersonalDetailsForm } from "@/features/account/components/personal-details-form";

export default function PersonalDetailsPage() {
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
        <div className="flex flex-col md:flex-row">
          {/* Left Sidebar */}
          <AccountSidebar />

          {/* Right Content */}
          <div className="w-full max-w-[1376px] ml-[32px] pr-[287px] py-[80px]">
            <PersonalDetailsForm />
          </div>
        </div>
      </div>
    </div>
  );
}
