import { validate as uuidValidate } from "uuid";

export class AlertId {
  private constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new Error(`Invalid AlertId: ${value}`);
    }
  }

  static create(value: string): AlertId {
    return new AlertId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AlertId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
