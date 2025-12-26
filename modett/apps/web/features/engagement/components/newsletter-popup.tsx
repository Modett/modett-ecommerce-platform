"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { X } from "lucide-react";
import Image from "next/image";

// ============================================================================
// Types
// ============================================================================

interface NewsletterPopupProps {
  /** Delay in milliseconds before showing the popup (default: 3000ms) */
  delay?: number;
  /** Called when email is successfully submitted */
  onSubmit?: (email: string) => void | Promise<void>;
  /** Called when popup is dismissed */
  onDismiss?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = "modett_newsletter_dismissed";
const DISMISS_DURATION_DAYS = 7; // Don't show again for 7 days after dismiss

// ============================================================================
// Hook: useNewsletterPopup
// ============================================================================

function useNewsletterPopup(delay: number = 3000) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the popup recently
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dismissDate = new Date(parseInt(dismissedAt, 10));
      const now = new Date();
      const daysSinceDismiss =
        (now.getTime() - dismissDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceDismiss < DISMISS_DURATION_DAYS) {
        return; // Don't show popup
      }
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }, []);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  return {
    isVisible,
    email,
    setEmail,
    isLoading,
    setIsLoading,
    error,
    setError,
    isSuccess,
    setIsSuccess,
    dismiss,
    validateEmail,
  };
}

// ============================================================================
// Sub-Components
// ============================================================================

const ModettLogo = memo(() => (
  <div className="flex items-center justify-center gap-2">
    <Image
      src="/logo.png"
      alt="Modett"
      width={140}
      height={32}
      className="h-8 w-auto"
      priority
    />
  </div>
));
ModettLogo.displayName = "ModettLogo";

const LoadingSpinner = memo(() => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
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
));
LoadingSpinner.displayName = "LoadingSpinner";

const SuccessMessage = memo(() => (
  <div className="text-center py-8">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
      <svg
        className="w-8 h-8 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
    <h3
      className="text-xl font-semibold text-[#232D35] mb-2"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      Welcome to Modett!
    </h3>
    <p
      className="text-sm text-[#3E5460]"
      style={{ fontFamily: "Raleway, sans-serif" }}
    >
      Check your inbox for your 15% discount code.
    </p>
  </div>
));
SuccessMessage.displayName = "SuccessMessage";

// ============================================================================
// Main Component
// ============================================================================

export const NewsletterPopup = memo(
  ({ delay = 3000, onSubmit, onDismiss }: NewsletterPopupProps) => {
    const {
      isVisible,
      email,
      setEmail,
      isLoading,
      setIsLoading,
      error,
      setError,
      isSuccess,
      setIsSuccess,
      dismiss,
      validateEmail,
    } = useNewsletterPopup(delay);

    const handleClose = useCallback(() => {
      dismiss();
      onDismiss?.();
    }, [dismiss, onDismiss]);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim()) {
          setError("Please enter your email address");
          return;
        }

        if (!validateEmail(email)) {
          setError("Please enter a valid email address");
          return;
        }

        setIsLoading(true);

        try {
          if (onSubmit) {
            await onSubmit(email);
          }
          setIsSuccess(true);

          // Auto-close after success
          setTimeout(() => {
            handleClose();
          }, 3000);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
          setIsLoading(false);
        }
      },
      [
        email,
        onSubmit,
        validateEmail,
        setError,
        setIsLoading,
        setIsSuccess,
        handleClose,
      ]
    );

    // Don't render if not visible
    if (!isVisible) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[300px] bg-[#C1D2CC]/95 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="newsletter-popup-title"
          style={{ maxHeight: "550px" }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 text-[#232D35] hover:text-[#765C4D] transition-colors z-10"
            aria-label="Close newsletter popup"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Content */}
          <div className="px-6 py-10 flex flex-col items-center text-center">
            {isSuccess ? (
              <SuccessMessage />
            ) : (
              <>
                {/* Logo */}
                <div className="mb-8">
                  <ModettLogo />
                </div>

                {/* Heading */}
                <h2
                  id="newsletter-popup-title"
                  className="text-[22px] font-normal text-[#232D35] mb-2"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Sign Up & Enjoy
                </h2>

                {/* Discount Text */}
                <p
                  className="text-[56px] font-semibold text-[#232D35] leading-none mb-4 italic"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  15% Off
                </p>

                {/* Description */}
                <p
                  className="text-[14px] text-[#3E5460] leading-relaxed mb-8 max-w-[250px]"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Be the first to know about new arrivals, exclusive offers and
                  more.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full space-y-3">
                  {/* Email Input */}
                  <input
                    type="email"
                    placeholder="Enter e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full h-[48px] px-4 border border-[#BBA496] bg-white text-[14px] text-[#232D35] placeholder:text-[#A09B93] focus:outline-none focus:border-[#232D35] transition-colors"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                    autoComplete="email"
                    required
                    aria-label="Email address"
                    aria-describedby={error ? "newsletter-error" : undefined}
                  />

                  {/* Error Message */}
                  {error && (
                    <p
                      id="newsletter-error"
                      className="text-sm text-red-600"
                      role="alert"
                    >
                      {error}
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[48px] bg-[#232D35] text-white text-[14px] font-medium tracking-[2px] uppercase hover:bg-[#1a2228] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        <span>SIGNING UP...</span>
                      </>
                    ) : (
                      "SIGN UP"
                    )}
                  </button>
                </form>

                {/* Decline Link */}
                <button
                  onClick={handleClose}
                  className="mt-4 text-[14px] text-[#3E5460] underline hover:text-[#232D35] transition-colors"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Decline offer
                </button>
              </>
            )}
          </div>
        </div>
      </>
    );
  }
);

NewsletterPopup.displayName = "NewsletterPopup";

export default NewsletterPopup;
