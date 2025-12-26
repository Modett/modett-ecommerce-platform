/**
 * Unified error handling utility
 * Extracts user-friendly error messages from various error types
 */

interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: string;
}

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return "An unexpected error occurred";
  }

  // Handle Error instances
  if (error instanceof Error) {
    return error.message;
  }

  // Handle API error responses
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiErrorResponse;

    if (apiError.error) {
      return apiError.error;
    }

    if (apiError.message) {
      return apiError.message;
    }

    if (apiError.details) {
      return apiError.details;
    }
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Fallback for unknown error types
  return "An unexpected error occurred";
}

/**
 * Logs error to console in development mode with additional context
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === "development") {
    console.error(
      `[Error${context ? ` - ${context}` : ""}]:`,
      error
    );
  }
}

/**
 * Combined error handler: logs and returns user-friendly message
 */
export function handleError(error: unknown, context?: string): string {
  logError(error, context);
  return getErrorMessage(error);
}
