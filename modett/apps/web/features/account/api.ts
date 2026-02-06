import axios from "axios";
import { UserProfile, OrderSummary } from "./types";
import { getGuestToken } from "@/features/cart/api";

const accountApiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL?.replace("/catalog", "") ||
    "http://localhost:3001/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  if (authToken) {
    return { Authorization: `Bearer ${authToken}` };
  }

  const guestToken = await getGuestToken();
  return { "X-Guest-Token": guestToken };
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const headers = await getAuthHeaders();
  const { data } = await accountApiClient.get("/auth/me", { headers });
  return data.data;
};

export const getMyOrders = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<OrderSummary[]> => {
  const headers = await getAuthHeaders();
  const { data } = await accountApiClient.get("/orders", {
    headers,
    params,
  });

  if (data.data?.orders && Array.isArray(data.data.orders)) {
    return data.data.orders;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};
