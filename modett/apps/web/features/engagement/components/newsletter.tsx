"use client";

import * as React from "react";

// ============================================================================
// Types
// ============================================================================

interface NewsletterProps {
  title?: string;
  description?: string;
  onSubmit?: (email: string) => void | Promise<void>;
}

interface FormMessage {
  type: "success" | "error";
  text: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Mail icon SVG component
 */
const MailIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="#3E5460"
      strokeWidth="1.5"
      fill="none"
    />
    <path d="M3 7l9 6 9-6" stroke="#3E5460" strokeWidth="1.5" fill="none" />
  </svg>
);

/**
 * Newsletter email input field
 */
const NewsletterInput = ({
  email,
  onChange,
  disabled,
  className = "",
}: {
  email: string;
  onChange: (value: string) => void;
  disabled: boolean;
  className?: string;
}) => (
  <input
    type="email"
    placeholder="Enter e-mail"
    value={email}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className={className}
    autoComplete="email"
    required
  />
);

/**
 * Subscribe button component
 */
const SubscribeButton = ({
  isLoading,
  className = "",
  iconSize = 16,
}: {
  isLoading: boolean;
  className?: string;
  iconSize?: number;
}) => (
  <button
    type="submit"
    disabled={isLoading}
    className={className}
    aria-label="Subscribe to newsletter"
  >
    <MailIcon size={iconSize} />
    <span>{isLoading ? "SUBSCRIBING..." : "SUBSCRIBE"}</span>
  </button>
);

/**
 * Form status message (success or error)
 */
const FormMessage = ({ message }: { message: FormMessage | null }) => {
  if (!message) return null;

  const messageColor =
    message.type === "success" ? "text-green-400" : "text-red-400";

  return <p className={`text-xs mt-2 ${messageColor}`}>{message.text}</p>;
};

/**
 * Privacy policy disclaimer text
 */
const PrivacyDisclaimer = ({ className = "" }: { className?: string }) => (
  <p className={className}>
    By subscribing, you agree to our privacy policy and terms of service
  </p>
);

// ============================================================================
// Mobile Newsletter Form
// ============================================================================

const MobileNewsletterForm = ({
  email,
  setEmail,
  isLoading,
  message,
  handleSubmit,
}: {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  message: FormMessage | null;
  handleSubmit: (e: React.FormEvent) => void;
}) => (
  <div className="block md:hidden text-center">
    {/* Form */}
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-[348px] mx-auto"
    >
      {/* Email Input */}
      <NewsletterInput
        email={email}
        onChange={setEmail}
        disabled={isLoading}
        className="w-full bg-transparent border border-white/60 text-white placeholder:text-white/60 focus:outline-none focus:ring-0 px-4 h-[54px] text-sm rounded-none"
      />

      {/* Spacer */}
      <div className="h-3" />

      {/* Submit Button */}
      <SubscribeButton
        isLoading={isLoading}
        iconSize={18}
        className="w-full flex items-center justify-center gap-2 bg-white text-[#3E5460] uppercase font-medium tracking-wider px-6 h-12 border-none rounded-none text-sm hover:bg-gray-100 transition-colors"
      />

      {/* Status Message */}
      <FormMessage message={message} />

      {/* Privacy Disclaimer */}
      <PrivacyDisclaimer className="text-[11px] text-white/60 mt-4 leading-relaxed" />
    </form>
  </div>
);

// ============================================================================
// Desktop Newsletter Form
// ============================================================================

const DesktopNewsletterForm = ({
  email,
  setEmail,
  isLoading,
  message,
  handleSubmit,
}: {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  message: FormMessage | null;
  handleSubmit: (e: React.FormEvent) => void;
}) => (
  <div className="hidden md:flex md:items-start md:justify-between gap-8">
    {/* Right Side: Form Container */}
    <div className="flex-1 flex flex-col items-end w-full">
      {/* Inline Form (Input + Button) */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-row items-stretch border border-white/60 bg-transparent rounded-none overflow-hidden"
      >
        {/* Email Input */}
        <NewsletterInput
          email={email}
          onChange={setEmail}
          disabled={isLoading}
          className="flex-1 bg-transparent border-none text-white placeholder:text-white/60 focus:outline-none focus:ring-0 px-4 h-11 text-sm"
        />

        {/* Submit Button */}
        <SubscribeButton
          isLoading={isLoading}
          iconSize={16}
          className="flex items-center justify-center gap-2 bg-white text-[#3E5460] uppercase font-medium tracking-wider px-6 h-11 border-none rounded-none text-sm hover:bg-gray-100 transition-colors border-l border-white/60"
        />
      </form>

      {/* Status Message */}
      <FormMessage message={message} />

      {/* Privacy Disclaimer */}
      <PrivacyDisclaimer className="text-[11px] text-white/50 mt-2 leading-relaxed w-full max-w-md text-right" />
    </div>
  </div>
);

// ============================================================================
// Main Newsletter Component
// ============================================================================

export function Newsletter({
  title = "Join the Modern Muse community",
  description = "Get the latest fashion trends and exclusive offers",
  onSubmit,
}: NewsletterProps) {
  // ============================================================================
  // State Management
  // ============================================================================

  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<FormMessage | null>(null);

  // ============================================================================
  // Form Submission Handler
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }

    // Start loading state
    setIsLoading(true);
    setMessage(null);

    try {
      // Call onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(email);
      }

      // Show success message
      setMessage({ type: "success", text: "Thank you for subscribing!" });
      setEmail("");
    } catch (error) {
      // Show error message
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      // Stop loading state
      setIsLoading(false);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <section className="bg-[#3E5460] text-white py-[60px] md:py-14">
      <div className="max-w-7xl mx-auto px-0 md:px-6 lg:px-8">
        {/* Mobile Version: Centered Layout */}
        <div className="flex md:hidden text-center flex-col gap-[80px] px-5">
          {/* Title & Description */}
          <div className="flex flex-col gap-[24px] w-full max-w-[348px] mx-auto">
            <h2
              className="font-serif w-full"
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "24px",
                fontWeight: 600,
                lineHeight: "130%",
                textAlign: "center",
                color: "#F8F5F2",
              }}
            >
              {title}
            </h2>
            <p
              className="w-full max-w-[350px] mx-auto"
              style={{
                fontFamily: "Raleway, sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                lineHeight: "28px",
                letterSpacing: "0%",
                textAlign: "center",
                color: "#F8F5F2",
              }}
            >
              {description}
            </p>
          </div>

          {/* Mobile Form */}
          <MobileNewsletterForm
            email={email}
            setEmail={setEmail}
            isLoading={isLoading}
            message={message}
            handleSubmit={handleSubmit}
          />
        </div>

        {/* Desktop Version: Side-by-Side Layout */}
        <div className="hidden md:flex md:items-start md:justify-between gap-8">
          {/* Left Side: Title & Description */}
          <div className="flex-1 min-w-[260px]">
            <h2 className="text-2xl font-semibold mb-1">{title}</h2>
            <p className="text-white/80 text-sm">{description}</p>
          </div>

          {/* Right Side: Desktop Form */}
          <DesktopNewsletterForm
            email={email}
            setEmail={setEmail}
            isLoading={isLoading}
            message={message}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </section>
  );
}
