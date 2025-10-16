import { Reminder } from "../entities/reminder.entity";
import { ReminderId } from "../value-objects/reminder-id.vo";

export interface ReminderRepository {
  // Core CRUD
  save(reminder: Reminder): Promise<void>;
  update(reminder: Reminder): Promise<void>;
  delete(reminderId: ReminderId): Promise<void>;
  findById(reminderId: ReminderId): Promise<Reminder | null>;

  // Finders
  findByUserId(userId: string): Promise<Reminder[]>;
  findByVariantId(variantId: string): Promise<Reminder[]>;
  findByStatus(status: string): Promise<Reminder[]>;
  findAll(options?: { limit?: number; offset?: number }): Promise<Reminder[]>;

  // Existence checks
  exists(reminderId: ReminderId): Promise<boolean>;
  existsByUserIdAndVariantId(
    userId: string,
    variantId: string
  ): Promise<boolean>;

  // Business queries
  countByUserId(userId: string): Promise<number>;
  countByVariantId(variantId: string): Promise<number>;
}
