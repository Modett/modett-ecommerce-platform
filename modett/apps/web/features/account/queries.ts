import { useQuery } from "@tanstack/react-query";
import * as accountApi from "./api";

export const accountKeys = {
  profile: ["account", "profile"] as const,
  orders: ["account", "orders"] as const,
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: accountKeys.profile,
    queryFn: accountApi.getUserProfile,
    retry: false, // Don't retry if 401
  });
};

export const useMyOrders = (params?: { status?: string }) => {
  return useQuery({
    queryKey: [...accountKeys.orders, params?.status],
    queryFn: () => accountApi.getMyOrders(params),
  });
};
