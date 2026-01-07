"use client";

import { TwoFactorSetup } from "@/features/auth/components/two-factor-setup";
import { COMMON_CLASSES } from "@/features/cart/constants/styles";

export default function SecurityPage() {
  return (
    <main
      className={`min-h-screen ${COMMON_CLASSES?.pageBg || "bg-gray-50"} py-12`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Account Security
        </h1>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Two-Factor Authentication
          </h2>
          <p className="text-gray-600 mb-6">
            Protect your account with an extra layer of security. once enabled,
            you will be required to enter a code from your authenticator app
            when logging in.
          </p>

          <TwoFactorSetup />
        </div>
      </div>
    </main>
  );
}
