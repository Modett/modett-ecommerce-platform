import axios from "axios";
import type {
  AnalyticsFilters,
  AnalyticsResponse,
} from "../types/analytics.types";

const adminApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAnalytics = async (
  filters: AnalyticsFilters = {}
): Promise<AnalyticsResponse> => {
  try {
    const { data } = await adminApiClient.get("/admin/analytics", {
      params: {
        startDate: filters.startDate,
        endDate: filters.endDate,
        granularity: filters.granularity || "day",
      },
    });

    return data;
  } catch (error: any) {
    const errorData = error.response?.data;
    console.error("Get analytics error:", {
      status: error.response?.status,
      data: errorData,
      message: error.message,
    });

    if (error.response?.status === 401) {
      console.warn(
        "Authentication failed. Please try logging out and logging back in."
      );
    }

    return {
      success: false,
      error: errorData?.error || "Failed to fetch analytics",
    };
  }
};
