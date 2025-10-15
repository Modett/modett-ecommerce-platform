import { validate as uuidValidate } from "uuid";

export class SupplierId {
  private constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new Error(`Invalid SupplierId: ${value}`);
    }
  }

  static create(value: string): SupplierId {
    return new SupplierId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: SupplierId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
