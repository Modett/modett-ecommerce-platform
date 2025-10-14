import { validate as uuidValidate } from "uuid";

export class PaymentTransactionId {
  private constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new Error(`Invalid PaymentTransactionId: ${value}`);
    }
  }

  static create(value: string): PaymentTransactionId {
    return new PaymentTransactionId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PaymentTransactionId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
