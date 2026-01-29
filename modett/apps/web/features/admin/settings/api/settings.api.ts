import axios from "axios";
import {
  SettingsResponse,
  UpdateSettingRequest,
  UpdateSettingsResponse,
} from "../types/settings.types";

// Create axios instance for admin API
const adminApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Add auth token interceptor
adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  console.log("[Settings API] Auth token:", token ? "Found" : "Missing");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("[Settings API] No auth token found in localStorage");
  }
  return config;
});

/**
 * Get all settings grouped by category
 */
export const getSettings = async (): Promise<SettingsResponse> => {
  try {
    const { data } = await adminApiClient.get("/admin/settings");
    return data;
  } catch (error: any) {
    console.error("Get settings error:", error);
    return {
      success: false,
      data: {},
      error: error.response?.data?.error || "Failed to fetch settings",
    };
  }
};

/**
 * Update settings (bulk)
 */
export const updateSettings = async (
  settings: UpdateSettingRequest[],
): Promise<UpdateSettingsResponse> => {
  try {
    await adminApiClient.put("/admin/settings", { settings });
    return { success: true };
  } catch (error: any) {
    console.error("Update settings error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update settings",
    };
  }
};
