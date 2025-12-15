import { useState, useCallback } from "react";
import { NEWSLETTER_CONFIG } from "../constants/newsletter-styles";

interface FormMessageData {
  type: "success" | "error";
  text: string;
}

interface UseNewsletterFormReturn {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  message: FormMessageData | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleRetry: () => Promise<void>;
  clearMessage: () => void;
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const validateEmail = (email: string): boolean => {
  if (!email || email.length > NEWSLETTER_CONFIG.maxEmailLength) {
    return false;
  }
  return EMAIL_REGEX.test(email.trim());
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return "Network error. Please check your connection and try again.";
    }
    if (error.message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

export const useNewsletterForm = (
  onSubmit?: (email: string) => void | Promise<void>
): UseNewsletterFormReturn => {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<FormMessageData | null>(null);
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState<string>("");

  const clearMessage = useCallback((): void => {
    setMessage(null);
  }, []);

  const submitEmail = useCallback(
    async (emailToSubmit: string): Promise<void> => {
      const trimmedEmail = emailToSubmit.trim();

      // Validation
      if (!trimmedEmail) {
        setMessage({ type: "error", text: "Please enter your email address" });
        return;
      }

      if (!validateEmail(trimmedEmail)) {
        setMessage({ type: "error", text: "Please enter a valid email address" });
        return;
      }

      setIsLoading(true);
      setMessage(null);
      setLastSubmittedEmail(trimmedEmail);

      try {
        if (onSubmit) {
          await onSubmit(trimmedEmail);
        }

        setMessage({ type: "success", text: "Thank you for subscribing!" });
        setEmail("");

        // Clear success message after duration
        setTimeout(() => {
          setMessage(null);
        }, NEWSLETTER_CONFIG.successMessageDuration);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setMessage({
          type: "error",
          text: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [onSubmit]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      await submitEmail(email);
    },
    [email, submitEmail]
  );

  const handleRetry = useCallback(async (): Promise<void> => {
    if (lastSubmittedEmail) {
      await submitEmail(lastSubmittedEmail);
    }
  }, [lastSubmittedEmail, submitEmail]);

  return {
    email,
    setEmail,
    isLoading,
    message,
    handleSubmit,
    handleRetry,
    clearMessage,
  };
};
