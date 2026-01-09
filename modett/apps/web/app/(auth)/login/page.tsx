"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { TwoFactorLogin } from "@/features/auth/components/two-factor-login";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, twoFactorChallenge, reset2FAChallenge, isAuthenticated } =
    useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect on success
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  if (twoFactorChallenge) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F8F5F2] py-12 px-4">
        <TwoFactorLogin
          userId={twoFactorChallenge.userId}
          tempToken={twoFactorChallenge.tempToken}
          onSuccess={() => router.push("/")}
          onCancel={reset2FAChallenge}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8F5F2] py-12 px-4">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Modett"
              width={180}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#BBA496]/30 p-8 md:p-10">
          {/* Heading */}
          <div className="mb-8">
            <h1
              className="text-[28px] font-normal text-[#232D35] text-center mb-2"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Welcome Back
            </h1>
            <p
              className="text-[14px] text-[#3E5460] text-center"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Sign in to your Modett account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 p-4 text-[14px] text-red-700"
                style={{ fontFamily: "Raleway, sans-serif" }}
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-[12px] font-medium text-[#232D35] mb-2 uppercase tracking-wide"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full h-[48px] px-4 border border-[#BBA496] bg-white text-[14px] text-[#232D35] placeholder:text-[#A09B93] focus:outline-none focus:border-[#232D35] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "Raleway, sans-serif" }}
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-[12px] font-medium text-[#232D35] mb-2 uppercase tracking-wide"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-[48px] px-4 pr-12 border border-[#BBA496] bg-white text-[14px] text-[#232D35] placeholder:text-[#A09B93] focus:outline-none focus:border-[#232D35] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09B93] hover:text-[#232D35] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-[13px] text-[#3E5460] hover:text-[#232D35] underline transition-colors"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[48px] bg-[#232D35] text-white text-[14px] font-medium tracking-[2px] uppercase hover:bg-[#1a2228] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>SIGNING IN...</span>
                </>
              ) : (
                "SIGN IN"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#BBA496]/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className="px-4 bg-white text-[#A09B93] text-[12px]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                New to Modett?
              </span>
            </div>
          </div>

          {/* Create Account Link */}
          <div className="text-center">
            <Link
              href="/register"
              className="inline-block w-full h-[48px] leading-[48px] border border-[#232D35] text-[#232D35] text-[14px] font-medium tracking-[2px] uppercase hover:bg-[#232D35] hover:text-white transition-colors"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              CREATE ACCOUNT
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p
            className="text-[12px] text-[#3E5460]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[#232D35]">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-[#232D35]">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
