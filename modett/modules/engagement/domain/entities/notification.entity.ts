import { NotificationId } from "../value-objects/notification-id.vo";

// Enums from database schema
export type NotificationType =
  | "order_confirm"
  | "shipped"
  | "restock"
  | "review_request"
  | "care_guide"
  | "promo";

export type ChannelType = "email" | "sms" | "whatsapp" | "push";

export interface CreateNotificationData {
  type: NotificationType;
  channel?: ChannelType;
  templateId?: string;
  payload?: Record<string, any>;
  scheduledAt?: Date;
}

export interface NotificationEntityData {
  notificationId: string;
  type: NotificationType;
  channel?: ChannelType;
  templateId?: string;
  payload: Record<string, any>;
  status?: string;
  scheduledAt?: Date;
  sentAt?: Date;
  error?: string;
}

export class Notification {
  private constructor(
    private readonly notificationId: NotificationId,
    private readonly type: NotificationType,
    private readonly channel?: ChannelType,
    private readonly templateId?: string,
    private payload: Record<string, any> = {},
    private status?: string,
    private scheduledAt?: Date,
    private sentAt?: Date,
    private error?: string
  ) {}

  // Factory methods
  static create(data: CreateNotificationData): Notification {
    const notificationId = NotificationId.create();

    if (!data.type) {
      throw new Error("Notification type is required");
    }

    return new Notification(
      notificationId,
      data.type,
      data.channel,
      data.templateId,
      data.payload || {},
      undefined,
      data.scheduledAt
    );
  }

  static reconstitute(data: NotificationEntityData): Notification {
    const notificationId = NotificationId.fromString(data.notificationId);

    return new Notification(
      notificationId,
      data.type,
      data.channel,
      data.templateId,
      data.payload,
      data.status,
      data.scheduledAt,
      data.sentAt,
      data.error
    );
  }

  // Getters
  getNotificationId(): NotificationId {
    return this.notificationId;
  }

  getType(): NotificationType {
    return this.type;
  }

  getChannel(): ChannelType | undefined {
    return this.channel;
  }

  getTemplateId(): string | undefined {
    return this.templateId;
  }

  getPayload(): Record<string, any> {
    return this.payload;
  }

  getStatus(): string | undefined {
    return this.status;
  }

  getScheduledAt(): Date | undefined {
    return this.scheduledAt;
  }

  getSentAt(): Date | undefined {
    return this.sentAt;
  }

  getError(): string | undefined {
    return this.error;
  }

  // Business methods
  updatePayload(payload: Record<string, any>): void {
    this.payload = { ...this.payload, ...payload };
  }

  schedule(scheduledAt: Date): void {
    if (scheduledAt <= new Date()) {
      throw new Error("Scheduled time must be in the future");
    }
    this.scheduledAt = scheduledAt;
    this.status = "scheduled";
  }

  markAsSending(): void {
    this.status = "sending";
  }

  markAsSent(): void {
    this.status = "sent";
    this.sentAt = new Date();
    this.error = undefined;
  }

  markAsFailed(error: string): void {
    this.status = "failed";
    this.error = error;
  }

  retry(): void {
    if (this.status !== "failed") {
      throw new Error("Can only retry failed notifications");
    }
    this.status = "pending";
    this.error = undefined;
  }

  // Helper methods
  isPending(): boolean {
    return !this.status || this.status === "pending";
  }

  isScheduled(): boolean {
    return this.status === "scheduled";
  }

  isSending(): boolean {
    return this.status === "sending";
  }

  isSent(): boolean {
    return this.status === "sent";
  }

  isFailed(): boolean {
    return this.status === "failed";
  }

  isDue(): boolean {
    if (!this.scheduledAt) {
      return true;
    }
    return this.scheduledAt <= new Date();
  }

  toSnapshot(): NotificationEntityData {
    return {
      notificationId: this.notificationId.getValue(),
      type: this.type,
      channel: this.channel,
      templateId: this.templateId,
      payload: this.payload,
      status: this.status,
      scheduledAt: this.scheduledAt,
      sentAt: this.sentAt,
      error: this.error,
    };
  }
}
