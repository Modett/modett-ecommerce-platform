import { validate as uuidValidate } from "uuid";

export class TransactionId {
  private constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new Error(`Invalid TransactionId: ${value}`);
    }
  }

  static create(value: string): TransactionId {
    return new TransactionId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TransactionId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
