import { v4 as uuidv4 } from "uuid";

export class CheckoutId {
  private constructor(private readonly value: string) {
    if (!CheckoutId.isValid(value)) {
      throw new Error(`Invalid checkout ID: ${value}`);
    }
  }

  static create(): CheckoutId {
    return new CheckoutId(uuidv4());
  }

  static fromString(value: string): CheckoutId {
    return new CheckoutId(value);
  }

  static isValid(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: CheckoutId): boolean {
    return this.value === other.value;
  }
}
