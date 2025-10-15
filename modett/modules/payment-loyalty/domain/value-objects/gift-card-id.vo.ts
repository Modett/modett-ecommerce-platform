import { randomUUID } from "crypto";

export class GiftCardId {
  private readonly value: string;

  constructor(value?: string) {
    if (value) {
      if (!this.isValidUuid(value)) {
        throw new Error("Invalid Gift Card ID format. Must be a valid UUID.");
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

  equals(other: GiftCardId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static create(): GiftCardId {
    return new GiftCardId();
  }

  static fromString(value: string): GiftCardId {
    return new GiftCardId(value);
  }
}
