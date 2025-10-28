import { config } from "./config";

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "APIError";
  }
}

export interface FetcherOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  token?: string;
  guestToken?: string;
}

export async function fetcher<T = any>(
  endpoint: string,
  options: FetcherOptions = {}
): Promise<T> {
  const { params, token, guestToken, headers: initHeaders, ...init } = options;

  // Build URL with query parameters
  let url = `${config.apiUrl}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  // Build headers
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (initHeaders) {
    new Headers(initHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  // Add auth token if provided
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (guestToken) {
    headers.set("X-Guest-Token", guestToken);
  }

  // Make the request
  const response = await fetch(url, {
    ...init,
    headers,
  });

  // Handle errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new APIError(response.status, response.statusText, errorData);
  }

  // Return JSON response
  return response.json();
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, options?: FetcherOptions) =>
    fetcher<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, data?: any, options?: FetcherOptions) =>
    fetcher<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T = any>(endpoint: string, data?: any, options?: FetcherOptions) =>
    fetcher<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T = any>(endpoint: string, data?: any, options?: FetcherOptions) =>
    fetcher<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T = any>(endpoint: string, options?: FetcherOptions) =>
    fetcher<T>(endpoint, { ...options, method: "DELETE" }),
};
