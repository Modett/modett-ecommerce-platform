import { validate as uuidValidate } from "uuid";

export class PurchaseOrderId {
  private constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new Error(`Invalid PurchaseOrderId: ${value}`);
    }
  }

  static create(value: string): PurchaseOrderId {
    return new PurchaseOrderId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PurchaseOrderId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
