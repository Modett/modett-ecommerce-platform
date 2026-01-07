import axios from "axios";
import { config } from "@/lib/config";

// Types
export interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  isGuest: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
  requires2fa?: boolean;
  tempToken?: string;
  userId?: string;
}

export interface Generate2FAResponse {
  secret: string;
  otpauthUrl: string;
  qrCode: string;
}

export interface Enable2FAResponse {
  backupCodes: string[];
}

// Create axios instance
const authApiClient = axios.create({
  baseURL: `${config.apiUrl}/auth`,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Interceptor to add token
authApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Methods
export const generate2FA = async (): Promise<Generate2FAResponse> => {
  const { data } = await authApiClient.get("/2fa/generate");
  return data.data;
};

export const enable2FA = async (
  token: string,
  secret: string
): Promise<Enable2FAResponse> => {
  const { data } = await authApiClient.post("/2fa/enable", { token, secret });
  return data.data;
};

export const verify2FA = async (
  token: string
): Promise<{ success: boolean; message: string }> => {
  const { data } = await authApiClient.post("/2fa/verify", { token });
  return data;
};

export const loginWith2FA = async (
  tempToken: string,
  token: string
): Promise<AuthResponse> => {
  const { data } = await authApiClient.post("/login/2fa", { tempToken, token });
  return data.data;
};

export const disable2FA = async (
  password: string
): Promise<{ success: boolean; message: string }> => {
  const { data } = await authApiClient.post("/2fa/disable", { password });
  return data;
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await authApiClient.post("/login", { email, password });
  return data.data;
};
