import { SubscriptionId } from "../value-objects/subscription-id.vo";

export interface CreateNewsletterSubscriptionData {
  email: string;
  source?: string;
}

export interface NewsletterSubscriptionEntityData {
  subscriptionId: string;
  email: string;
  status?: string;
  source?: string;
  createdAt: Date;
}

export class NewsletterSubscription {
  private constructor(
    private readonly subscriptionId: SubscriptionId,
    private readonly email: string,
    private status?: string,
    private readonly source?: string,
    private readonly createdAt: Date = new Date()
  ) {}

  // Factory methods
  static create(data: CreateNewsletterSubscriptionData): NewsletterSubscription {
    const subscriptionId = SubscriptionId.create();

    if (!data.email) {
      throw new Error("Email is required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email format");
    }

    return new NewsletterSubscription(
      subscriptionId,
      data.email.toLowerCase().trim(),
      "active",
      data.source
    );
  }

  static reconstitute(data: NewsletterSubscriptionEntityData): NewsletterSubscription {
    const subscriptionId = SubscriptionId.fromString(data.subscriptionId);

    return new NewsletterSubscription(
      subscriptionId,
      data.email,
      data.status,
      data.source,
      data.createdAt
    );
  }

  // Getters
  getSubscriptionId(): SubscriptionId {
    return this.subscriptionId;
  }

  getEmail(): string {
    return this.email;
  }

  getStatus(): string | undefined {
    return this.status;
  }

  getSource(): string | undefined {
    return this.source;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  // Business methods
  activate(): void {
    this.status = "active";
  }

  unsubscribe(): void {
    this.status = "unsubscribed";
  }

  bounce(): void {
    this.status = "bounced";
  }

  markAsSpam(): void {
    this.status = "spam";
  }

  // Helper methods
  isActive(): boolean {
    return this.status === "active";
  }

  isUnsubscribed(): boolean {
    return this.status === "unsubscribed";
  }

  isBounced(): boolean {
    return this.status === "bounced";
  }

  isSpam(): boolean {
    return this.status === "spam";
  }

  canReceiveEmails(): boolean {
    return this.status === "active";
  }

  toSnapshot(): NewsletterSubscriptionEntityData {
    return {
      subscriptionId: this.subscriptionId.getValue(),
      email: this.email,
      status: this.status,
      source: this.source,
      createdAt: this.createdAt,
    };
  }
}
