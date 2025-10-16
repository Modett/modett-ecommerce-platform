import { NewsletterSubscription } from "../entities/newsletter-subscription.entity";
import { SubscriptionId } from "../value-objects/subscription-id.vo";

export interface NewsletterSubscriptionRepository {
  // Core CRUD
  save(subscription: NewsletterSubscription): Promise<void>;
  update(subscription: NewsletterSubscription): Promise<void>;
  delete(subscriptionId: SubscriptionId): Promise<void>;
  findById(
    subscriptionId: SubscriptionId
  ): Promise<NewsletterSubscription | null>;

  // Finders
  findByEmail(email: string): Promise<NewsletterSubscription | null>;
  findByStatus(status: string): Promise<NewsletterSubscription[]>;
  findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NewsletterSubscription[]>;

  // Existence checks
  exists(subscriptionId: SubscriptionId): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;

  // Business queries
  countByStatus(status: string): Promise<number>;
}
