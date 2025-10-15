import { validate as uuidValidate } from "uuid";

export class LocationId {
  private constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new Error(`Invalid LocationId: ${value}`);
    }
  }

  static create(value: string): LocationId {
    return new LocationId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: LocationId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
