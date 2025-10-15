import { validate as uuidValidate } from "uuid";

export class ReservationId {
  private constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new Error(`Invalid ReservationId: ${value}`);
    }
  }

  static create(value: string): ReservationId {
    return new ReservationId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ReservationId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
