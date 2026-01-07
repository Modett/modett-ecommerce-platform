"use client";

import { useState } from "react";
import { loginWith2FA } from "../api";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface TwoFactorLoginProps {
  userId: string;
  tempToken: string;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

export function TwoFactorLogin({
  userId,
  tempToken,
  onSuccess,
  onCancel,
}: TwoFactorLoginProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await loginWith2FA(tempToken, verificationCode);
      onSuccess(data);
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center mb-6">
        <div className="p-3 bg-blue-50 rounded-full mb-3">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Two-Factor Authentication
        </h2>
        <p className="text-center text-gray-600 mt-2">
          Enter the 6-digit code from your authenticator app to log in.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) =>
              setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            className="w-full p-4 text-center text-2xl tracking-[1em] border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
            maxLength={6}
            autoFocus
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100 text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Verify Code"
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}
