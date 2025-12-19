/**
 * Common error types for the application
 */

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  public statusCode?: number;
  public response?: ApiErrorResponse;

  constructor(
    message: string,
    statusCode?: number,
    response?: ApiErrorResponse
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

export class CheckoutError extends Error {
  public code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'CheckoutError';
    this.code = code;
  }
}

export class PaymentError extends Error {
  public code?: string;
  public details?: Record<string, unknown>;

  constructor(message: string, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Type guard to check if an error is a CheckoutError
 */
export function isCheckoutError(error: unknown): error is CheckoutError {
  return error instanceof CheckoutError;
}

/**
 * Type guard to check if an error is a PaymentError
 */
export function isPaymentError(error: unknown): error is PaymentError {
  return error instanceof PaymentError;
}

/**
 * Get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
