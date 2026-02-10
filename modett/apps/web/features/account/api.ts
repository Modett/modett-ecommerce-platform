import axios from "axios";
import { UserProfile, OrderSummary } from "./types";
import { getGuestToken } from "@/features/cart/api";

const accountApiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL?.replace("/catalog", "") ||
    "http://localhost:3001/api/v1",
  timeout: 10000,
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
  const { data } = await accountApiClient.get("/users/me", { headers });
  return data.data;
};

export const updateUserProfile = async (
  data: Partial<UserProfile>,
): Promise<UserProfile> => {
  const headers = await getAuthHeaders();
  const response = await accountApiClient.put("/profile/me", data, {
    headers,
  });
  return response.data.data;
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

export const changePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean; message: string }> => {
  const headers = await getAuthHeaders();
  const { data } = await accountApiClient.post(
    "/auth/change-password",
    passwordData,
    { headers },
  );
  return data;
};

export const changeEmail = async (emailData: {
  newEmail: string;
  password: string;
}): Promise<{ success: boolean; message: string }> => {
  const headers = await getAuthHeaders();
  const { data } = await accountApiClient.post(
    "/auth/change-email",
    emailData,
    { headers },
  );
  return data;
};

export const deleteAccount = async (
  password: string,
): Promise<{ success: boolean; message: string }> => {
  const headers = await getAuthHeaders();
  const { data } = await accountApiClient.post(
    "/auth/delete-account",
    { password },
    { headers },
  );
  return data;
};

// Address Management
export const getProvinces = async () => {
  const response = await accountApiClient.get("/master/provinces");
  return response.data;
};

export const getAddresses = async () => {
  const headers = await getAuthHeaders();
  const { data } = await accountApiClient.get("/addresses/me", { headers });
  // Ensure we return an array, handling potential wrapping in data property
  return Array.isArray(data.data) ? data.data : [];
};

export const createAddress = async (addressData: any) => {
  const headers = await getAuthHeaders();
  const { data } = await accountApiClient.post("/addresses/me", addressData, {
    headers,
  });
  return data.data;
};

export const updateAddress = async (id: string, addressData: any) => {
  const headers = await getAuthHeaders();
  const { data } = await accountApiClient.put(
    `/addresses/me/${id}`,
    addressData,
    {
      headers,
    },
  );
  return data.data;
};

export const deleteAddress = async (id: string) => {
  const headers = await getAuthHeaders();
  await accountApiClient.delete(`/addresses/me/${id}`, { headers });
};

export const setDefaultAddress = async (
  id: string,
  type: "shipping" | "billing",
) => {
  // Reuse updateAddress since there is no dedicated set-default endpoint
  return updateAddress(id, { type, isDefault: true });
};
