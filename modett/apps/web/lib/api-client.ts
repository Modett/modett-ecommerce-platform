import axios from "axios";
import { config } from "./config";
import { logError } from "./error-handler";

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const responseData = error.response?.data;
    console.log("[Debug] API Error Response:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: responseData,
      dataType: typeof responseData,
      isObject: typeof responseData === "object",
      keys: responseData ? Object.keys(responseData) : [],
    });

    logError(responseData || error, "API Error");
    return Promise.reject(error);
  }
);
