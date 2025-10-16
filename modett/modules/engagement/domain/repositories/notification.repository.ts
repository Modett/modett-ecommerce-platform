import { Notification } from "../entities/notification.entity";
import { NotificationId } from "../value-objects/notification-id.vo";

export interface NotificationRepository {
  // Core CRUD
  save(notification: Notification): Promise<void>;
  update(notification: Notification): Promise<void>;
  delete(notificationId: NotificationId): Promise<void>;
  findById(notificationId: NotificationId): Promise<Notification | null>;

  // Finders
  findByType(type: string): Promise<Notification[]>;
  findByChannel(channel: string): Promise<Notification[]>;
  findByStatus(status: string): Promise<Notification[]>;
  findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Notification[]>;

  // Existence checks
  exists(notificationId: NotificationId): Promise<boolean>;

  // Business queries
  countByType(type: string): Promise<number>;
  countByChannel(channel: string): Promise<number>;
}
