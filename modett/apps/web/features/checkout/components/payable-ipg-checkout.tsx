"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PayableIPGCheckoutProps {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  returnUrl?: string;
  cancelUrl?: string;
}

export function PayableIPGCheckout({
  orderId,
  amount,
  customerEmail,
  customerName,
  customerPhone,
  onSuccess,
  onError,
  returnUrl,
  cancelUrl,
}: PayableIPGCheckoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call your backend API to create PayableIPG payment
      const response = await fetch("/api/payments/payable-ipg/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          amount,
          customerEmail,
          customerName,
          customerPhone,
          returnUrl: returnUrl || `${window.location.origin}/payment/success`,
          cancelUrl: cancelUrl || `${window.location.origin}/payment/cancel`,
          description: `Payment for Order ${orderId}`,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.redirectUrl) {
        // Redirect to PayableIPG payment page
        window.location.href = data.data.redirectUrl;
      } else {
        const errorMessage = data.error || "Failed to create payment session";
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payable-ipg-checkout">
      <div className="payment-info mb-6">
        <h3 className="text-xl font-semibold mb-4">Payment Details</h3>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-medium">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium text-lg">LKR {amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Customer:</span>
            <span className="font-medium">{customerName}</span>
          </div>
        </div>

        <div className="accepted-cards mb-6">
          <p className="text-sm text-gray-600 mb-2">Accepted Cards:</p>
          <div className="flex gap-2">
            <div className="card-badge">💳 Visa</div>
            <div className="card-badge">💳 Mastercard</div>
            <div className="card-badge">💳 Amex</div>
            <div className="card-badge">💳 Diners</div>
            <div className="card-badge">💳 Discover</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Recurring payments available for Visa and Mastercard only
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Payment Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
            Processing...
          </>
        ) : (
          <>
            <span>Proceed to Payment</span>
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </>
        )}
      </button>

      <div className="security-notice mt-4 text-center">
        <p className="text-xs text-gray-500">
          🔒 Secured by PAYable IPG - Your payment information is encrypted and
          secure
        </p>
      </div>

      <style jsx>{`
        .card-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
