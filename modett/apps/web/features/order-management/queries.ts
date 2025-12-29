// ============================================================================
// ORDER MANAGEMENT REACT QUERY HOOKS
// ============================================================================

import { useQuery, useMutation } from "@tanstack/react-query";
import * as orderApi from "./order-api";
import type { TrackOrderParams } from "./order-api";

/**
 * Query key factory for order queries
 */
export const orderKeys = {
  all: ["orders"] as const,
  tracking: (params: TrackOrderParams) => ["orders", "track", params] as const,
  order: (orderNumber: string) => ["orders", orderNumber] as const,
};

/**
 * Hook to track an order by order number + contact or tracking number
 */
export const useTrackOrder = (params: TrackOrderParams | null) => {
  return useQuery({
    queryKey: params
      ? orderKeys.tracking(params)
      : ["orders", "track", "empty"],
    queryFn: async () => {
      if (!params) return null;
      const result = await orderApi.trackOrder(params);

      if (!result.success) {
        throw new Error(result.message || "Failed to track order");
      }

      return result.data;
    },
    enabled:
      !!params &&
      ((!!params.orderNumber && !!params.contact) || !!params.trackingNumber),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
};

/**
 * Hook to track an order as a mutation (for form submissions)
 */
export const useTrackOrderMutation = () => {
  return useMutation({
    mutationFn: (params: TrackOrderParams) => orderApi.trackOrder(params),
  });
};
