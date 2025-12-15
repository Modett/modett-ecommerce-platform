"use client";

import React, { memo, useCallback } from "react";
import {
  NEWSLETTER_CLASSES,
  NEWSLETTER_COLORS,
  NEWSLETTER_TYPOGRAPHY,
} from "../constants/newsletter-styles";
import { useNewsletterForm } from "../hooks/use-newsletter-form";

// ============================================================================
// Types
// ============================================================================

interface NewsletterProps {
  title?: string;
  description?: string;
  onSubmit?: (email: string) => void | Promise<void>;
  onSubscribeSuccess?: () => void;
  onSubscribeError?: (error: Error) => void;
}

interface FormMessageData {
  type: "success" | "error";
  text: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

const MailIcon = memo(({ size = 16 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke={NEWSLETTER_COLORS.iconStroke}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M3 7l9 6 9-6"
      stroke={NEWSLETTER_COLORS.iconStroke}
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
));
MailIcon.displayName = "MailIcon";

const LoadingSpinner = memo(() => (
  <svg
    className={NEWSLETTER_CLASSES.spinner}
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

const NewsletterInput = memo(
  ({
    email,
    onChange,
    disabled,
    className,
    id,
  }: {
    email: string;
    onChange: (value: string) => void;
    disabled: boolean;
    className: string;
    id: string;
  }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      },
      [onChange]
    );

    return (
      <input
        id={id}
        type="email"
        placeholder="Enter e-mail"
        value={email}
        onChange={handleChange}
        disabled={disabled}
        className={className}
        autoComplete="email"
        required
        aria-label="Email address"
        aria-required="true"
        maxLength={254}
      />
    );
  }
);
NewsletterInput.displayName = "NewsletterInput";

const SubscribeButton = memo(
  ({
    isLoading,
    className,
    iconSize = 16,
  }: {
    isLoading: boolean;
    className: string;
    iconSize?: number;
  }) => (
    <button
      type="submit"
      disabled={isLoading}
      className={className}
      aria-label={isLoading ? "Subscribing to newsletter" : "Subscribe to newsletter"}
    >
      {isLoading ? <LoadingSpinner /> : <MailIcon size={iconSize} />}
      <span>{isLoading ? "SUBSCRIBING..." : "SUBSCRIBE"}</span>
    </button>
  )
);
SubscribeButton.displayName = "SubscribeButton";

const StatusMessage = memo(
  ({
    message,
    onRetry,
  }: {
    message: FormMessageData | null;
    onRetry?: () => void;
  }) => {
    if (!message) return null;

    const isError = message.type === "error";
    const className = isError
      ? NEWSLETTER_CLASSES.statusError
      : NEWSLETTER_CLASSES.statusSuccess;

    return (
      <div
        className={className}
        role="alert"
        aria-live={isError ? "assertive" : "polite"}
        aria-atomic="true"
      >
        <p>{message.text}</p>
        {isError && onRetry && (
          <button
            onClick={onRetry}
            className="underline hover:no-underline mt-1"
            type="button"
          >
            Try again
          </button>
        )}
      </div>
    );
  }
);
StatusMessage.displayName = "StatusMessage";

const PrivacyDisclaimer = memo(({ className }: { className: string }) => (
  <p className={className}>
    By subscribing, you agree to our{" "}
    <a href="/privacy" className="underline hover:no-underline">
      privacy policy
    </a>{" "}
    and{" "}
    <a href="/terms" className="underline hover:no-underline">
      terms of service
    </a>
  </p>
));
PrivacyDisclaimer.displayName = "PrivacyDisclaimer";

const NewsletterHeader = memo(
  ({
    title,
    description,
    isMobile = false,
  }: {
    title: string;
    description: string;
    isMobile?: boolean;
  }) => {
    if (isMobile) {
      return (
        <div className={NEWSLETTER_CLASSES.mobileHeaderContainer}>
          <h2 className="font-serif w-full" style={NEWSLETTER_TYPOGRAPHY.mobileTitle}>
            {title}
          </h2>
          <p className="w-full max-w-[350px] mx-auto" style={NEWSLETTER_TYPOGRAPHY.mobileDescription}>
            {description}
          </p>
        </div>
      );
    }

    return (
      <div className={NEWSLETTER_CLASSES.desktopHeaderContainer}>
        <h2 className={NEWSLETTER_CLASSES.desktopHeaderTitle}>{title}</h2>
        <p className={NEWSLETTER_CLASSES.desktopHeaderDescription}>{description}</p>
      </div>
    );
  }
);
NewsletterHeader.displayName = "NewsletterHeader";

// ============================================================================
// Form Components
// ============================================================================

const MobileNewsletterForm = memo(
  ({
    email,
    setEmail,
    isLoading,
    message,
    handleSubmit,
    handleRetry,
  }: {
    email: string;
    setEmail: (email: string) => void;
    isLoading: boolean;
    message: FormMessageData | null;
    handleSubmit: (e: React.FormEvent) => void;
    handleRetry: () => void;
  }) => (
    <div className={NEWSLETTER_CLASSES.mobileFormContainer}>
      <form onSubmit={handleSubmit} className={NEWSLETTER_CLASSES.mobileForm} noValidate>
        <label htmlFor="newsletter-email-mobile" className={NEWSLETTER_CLASSES.srOnly}>
          Email Address
        </label>
        <NewsletterInput
          id="newsletter-email-mobile"
          email={email}
          onChange={setEmail}
          disabled={isLoading}
          className={NEWSLETTER_CLASSES.mobileInput}
        />

        {/* Anti-spam honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className={NEWSLETTER_CLASSES.srOnly}
          aria-hidden="true"
        />

        <div className="h-3" />

        <SubscribeButton
          isLoading={isLoading}
          iconSize={18}
          className={NEWSLETTER_CLASSES.mobileButton}
        />

        <StatusMessage message={message} onRetry={handleRetry} />

        <PrivacyDisclaimer className={NEWSLETTER_CLASSES.privacyMobile} />
      </form>
    </div>
  )
);
MobileNewsletterForm.displayName = "MobileNewsletterForm";

const DesktopNewsletterForm = memo(
  ({
    email,
    setEmail,
    isLoading,
    message,
    handleSubmit,
    handleRetry,
  }: {
    email: string;
    setEmail: (email: string) => void;
    isLoading: boolean;
    message: FormMessageData | null;
    handleSubmit: (e: React.FormEvent) => void;
    handleRetry: () => void;
  }) => (
    <div className={NEWSLETTER_CLASSES.desktopFormContainer}>
      <form onSubmit={handleSubmit} className={NEWSLETTER_CLASSES.desktopForm} noValidate>
        <label htmlFor="newsletter-email-desktop" className={NEWSLETTER_CLASSES.srOnly}>
          Email Address
        </label>
        <NewsletterInput
          id="newsletter-email-desktop"
          email={email}
          onChange={setEmail}
          disabled={isLoading}
          className={NEWSLETTER_CLASSES.desktopInput}
        />

        {/* Anti-spam honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className={NEWSLETTER_CLASSES.srOnly}
          aria-hidden="true"
        />

        <SubscribeButton
          isLoading={isLoading}
          iconSize={16}
          className={NEWSLETTER_CLASSES.desktopButton}
        />
      </form>

      <StatusMessage message={message} onRetry={handleRetry} />

      <PrivacyDisclaimer className={NEWSLETTER_CLASSES.privacyDesktop} />
    </div>
  )
);
DesktopNewsletterForm.displayName = "DesktopNewsletterForm";

// ============================================================================
// Main Newsletter Component
// ============================================================================

export const Newsletter = memo(
  ({
    title = "Join the Modern Muse community",
    description = "Get the latest fashion trends and exclusive offers",
    onSubmit,
    onSubscribeSuccess,
    onSubscribeError,
  }: NewsletterProps) => {
    const { email, setEmail, isLoading, message, handleSubmit, handleRetry } =
      useNewsletterForm(onSubmit);

    // Analytics hooks
    React.useEffect(() => {
      if (message?.type === "success" && onSubscribeSuccess) {
        onSubscribeSuccess();
      } else if (message?.type === "error" && onSubscribeError) {
        onSubscribeError(new Error(message.text));
      }
    }, [message, onSubscribeSuccess, onSubscribeError]);

    return (
      <section className={NEWSLETTER_CLASSES.section} aria-labelledby="newsletter-heading">
        <div className={NEWSLETTER_CLASSES.container}>
          {/* Screen reader heading */}
          <h2 id="newsletter-heading" className={NEWSLETTER_CLASSES.srOnly}>
            Newsletter Subscription
          </h2>

          {/* Mobile Version */}
          <div className={NEWSLETTER_CLASSES.mobileWrapper}>
            <NewsletterHeader title={title} description={description} isMobile />
            <MobileNewsletterForm
              email={email}
              setEmail={setEmail}
              isLoading={isLoading}
              message={message}
              handleSubmit={handleSubmit}
              handleRetry={handleRetry}
            />
          </div>

          {/* Desktop Version */}
          <div className={NEWSLETTER_CLASSES.desktopWrapper}>
            <NewsletterHeader title={title} description={description} />
            <DesktopNewsletterForm
              email={email}
              setEmail={setEmail}
              isLoading={isLoading}
              message={message}
              handleSubmit={handleSubmit}
              handleRetry={handleRetry}
            />
          </div>
        </div>
      </section>
    );
  }
);

Newsletter.displayName = "Newsletter";
