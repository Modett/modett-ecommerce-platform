// ============================================================================
// ENGAGEMENT (NEWSLETTER) TYPES
// ============================================================================

export interface NewsletterSubscription {
  subscriptionId: string;
  email: string;
  status: string;
  source?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SubscribeNewsletterParams {
  email: string;
  source?: string;
}

export interface UnsubscribeNewsletterParams {
  subscriptionId?: string;
  email?: string;
}

export interface NewsletterResponse {
  success: boolean;
  data?: NewsletterSubscription;
  message?: string;
  error?: string;
  errors?: string[];
}
