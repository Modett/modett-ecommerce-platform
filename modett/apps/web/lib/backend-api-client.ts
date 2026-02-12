import axios from "axios";

// Create shared axios instance for backend API
export const backendApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 10000, // Reduced to 10s for faster failure
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Add auth token interceptor
backendApiClient.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage (client-side)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for global error handling (optional but good practice)
backendApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 globally if needed (e.g., redirect to login)
    if (error.response?.status === 401) {
      console.warn(
        "Unauthorized access - redirecting to login might be needed",
      );
      // window.location.href = "/login"; // Careful with this in admin vs storefront
    }
    return Promise.reject(error);
  },
);
