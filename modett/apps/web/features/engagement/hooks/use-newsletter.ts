// ============================================================================
// NEWSLETTER HOOK
// ============================================================================

import { useCallback } from "react";
import * as engagementApi from "../api";
import type { SubscribeNewsletterParams, UnsubscribeNewsletterParams } from "../types";

/**
 * Hook to subscribe to newsletter
 * Returns a function that can be called to subscribe
 */
export function useNewsletterSubscribe() {
  return useCallback(async (email: string, source?: string) => {
    const params: SubscribeNewsletterParams = {
      email,
      source,
    };

    return await engagementApi.subscribeNewsletter(params);
  }, []);
}

/**
 * Hook to unsubscribe from newsletter
 * Returns a function that can be called to unsubscribe
 */
export function useNewsletterUnsubscribe() {
  return useCallback(async (subscriptionId?: string, email?: string) => {
    const params: UnsubscribeNewsletterParams = {
      subscriptionId,
      email,
    };

    return await engagementApi.unsubscribeNewsletter(params);
  }, []);
}

/**
 * Hook to get newsletter subscription
 * Returns a function that can be called to check subscription status
 */
export function useNewsletterSubscription() {
  return useCallback(async (subscriptionId?: string, email?: string) => {
    return await engagementApi.getNewsletterSubscription(subscriptionId, email);
  }, []);
}
