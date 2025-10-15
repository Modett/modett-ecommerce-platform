import { randomUUID } from "crypto";

export class PromotionUsageId {
  private readonly value: string;

  constructor(value?: string) {
    if (value) {
      if (!this.isValidUuid(value)) {
        throw new Error(
          "Invalid Promotion Usage ID format. Must be a valid UUID."
        );
      }
      this.value = value;
    } else {
      this.value = randomUUID();
    }
  }

  private isValidUuid(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PromotionUsageId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(): PromotionUsageId {
    return new PromotionUsageId();
  }

  static fromString(value: string): PromotionUsageId {
    return new PromotionUsageId(value);
  }
}
