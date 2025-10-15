import { randomUUID } from "crypto";

export class LoyaltyAccountId {
  private readonly value: string;

  constructor(value?: string) {
    if (value) {
      if (!this.isValidUuid(value)) {
        throw new Error(
          "Invalid Loyalty Account ID format. Must be a valid UUID."
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

  equals(other: LoyaltyAccountId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(): LoyaltyAccountId {
    return new LoyaltyAccountId();
  }

  static fromString(value: string): LoyaltyAccountId {
    return new LoyaltyAccountId(value);
  }
}
