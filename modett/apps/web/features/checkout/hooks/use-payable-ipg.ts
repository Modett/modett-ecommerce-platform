"use client";

import { useState, useCallback } from "react";

interface PayableIPGPayment {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  returnUrl?: string;
  cancelUrl?: string;
  description?: string;
}

interface PaymentResult {
  success: boolean;
  intentId?: string;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
}

// Backend API base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/catalog", "") ||
  "http://localhost:3001/api/v1";

export function usePayableIPG() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCallback(
    async (payment: PayableIPGPayment): Promise<PaymentResult> => {
      setLoading(true);
      setError(null);

      try {
        // Get guest token from localStorage
        const guestToken = localStorage.getItem("modett_guest_token");

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // Add guest token if available
        if (guestToken) {
          headers["X-Guest-Token"] = guestToken;
        }

        const response = await fetch(
          `${API_BASE_URL}/payments/payable-ipg/create`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(payment),
          }
        );

        const data = await response.json();

        if (data.success) {
          return {
            success: true,
            intentId: data.data.intentId,
            transactionId: data.data.transactionId,
            redirectUrl: data.data.redirectUrl,
          };
        } else {
          const errorMessage = data.error || "Payment creation failed";
          setError(errorMessage);
          return {
            success: false,
            error: errorMessage,
          };
        }
      } catch (err: any) {
        const errorMessage = err.message || "An error occurred";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const verifyPayment = useCallback(
    async (transactionId: string): Promise<PaymentResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/payments/payable-ipg/verify/${transactionId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          return {
            success: true,
            ...data.data,
          };
        } else {
          const errorMessage = data.error || "Payment verification failed";
          setError(errorMessage);
          return {
            success: false,
            error: errorMessage,
          };
        }
      } catch (err: any) {
        const errorMessage = err.message || "An error occurred";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refundPayment = useCallback(
    async (
      transactionId: string,
      amount?: number,
      reason?: string
    ): Promise<PaymentResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/payments/payable-ipg/refund`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transactionId,
              amount,
              reason,
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          return {
            success: true,
            ...data.data,
          };
        } else {
          const errorMessage = data.error || "Refund failed";
          setError(errorMessage);
          return {
            success: false,
            error: errorMessage,
          };
        }
      } catch (err: any) {
        const errorMessage = err.message || "An error occurred";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getSupportedCardTypes = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/payable-ipg/card-types`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (err) {
      return null;
    }
  }, []);

  return {
    createPayment,
    verifyPayment,
    refundPayment,
    getSupportedCardTypes,
    loading,
    error,
  };
}
