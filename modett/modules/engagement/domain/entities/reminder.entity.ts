import { ReminderId } from "../value-objects/reminder-id.vo";

// Enums from database schema
export type ReminderType = "restock" | "price_drop";
export type ContactType = "email" | "phone";
export type ChannelType = "email" | "sms" | "whatsapp" | "push";
export type ReminderStatus = "pending" | "sent" | "unsubscribed";

export interface CreateReminderData {
  type: ReminderType;
  variantId: string;
  userId?: string;
  contact: ContactType;
  channel: ChannelType;
  optInAt?: Date;
}

export interface ReminderEntityData {
  reminderId: string;
  type: ReminderType;
  variantId: string;
  userId?: string;
  contact: ContactType;
  channel: ChannelType;
  optInAt?: Date;
  status: ReminderStatus;
}

export class Reminder {
  private constructor(
    private readonly reminderId: ReminderId,
    private readonly type: ReminderType,
    private readonly variantId: string,
    private readonly contact: ContactType,
    private readonly channel: ChannelType,
    private status: ReminderStatus = "pending",
    private userId?: string,
    private optInAt?: Date
  ) {}

  // Factory methods
  static create(data: CreateReminderData): Reminder {
    const reminderId = ReminderId.create();

    if (!data.variantId) {
      throw new Error("Variant ID is required");
    }

    if (!data.type) {
      throw new Error("Reminder type is required");
    }

    if (!data.contact) {
      throw new Error("Contact type is required");
    }

    if (!data.channel) {
      throw new Error("Channel is required");
    }

    return new Reminder(
      reminderId,
      data.type,
      data.variantId,
      data.contact,
      data.channel,
      undefined, // status defaults to 'pending'
      data.userId,
      data.optInAt
    );
  }

  static reconstitute(data: ReminderEntityData): Reminder {
    const reminderId = ReminderId.fromString(data.reminderId);

    return new Reminder(
      reminderId,
      data.type,
      data.variantId,
      data.contact,
      data.channel,
      data.status,
      data.userId,
      data.optInAt
    );
  }

  // Getters
  getReminderId(): ReminderId {
    return this.reminderId;
  }

  getType(): ReminderType {
    return this.type;
  }

  getVariantId(): string {
    return this.variantId;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  getContact(): ContactType {
    return this.contact;
  }

  getChannel(): ChannelType {
    return this.channel;
  }

  getOptInAt(): Date | undefined {
    return this.optInAt;
  }

  getStatus(): ReminderStatus {
    return this.status;
  }

  // Business methods
  optIn(): void {
    this.optInAt = new Date();
  }

  markAsSent(): void {
    this.status = "sent";
  }

  unsubscribe(): void {
    this.status = "unsubscribed";
  }

  // Helper methods
  isPending(): boolean {
    return this.status === "pending";
  }

  isSent(): boolean {
    return this.status === "sent";
  }

  isUnsubscribed(): boolean {
    return this.status === "unsubscribed";
  }

  isRestockReminder(): boolean {
    return this.type === "restock";
  }

  isPriceDropReminder(): boolean {
    return this.type === "price_drop";
  }

  toSnapshot(): ReminderEntityData {
    return {
      reminderId: this.reminderId.getValue(),
      type: this.type,
      variantId: this.variantId,
      userId: this.userId,
      contact: this.contact,
      channel: this.channel,
      optInAt: this.optInAt,
      status: this.status,
    };
  }
}
