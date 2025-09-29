export class Quantity {
  private readonly value: number;
  private static readonly MIN_QUANTITY = 1;
  private static readonly MAX_QUANTITY = 999;

  constructor(value: number) {
    if (!Number.isInteger(value)) {
      throw new Error("Quantity must be a whole number");
    }

    if (value < Quantity.MIN_QUANTITY) {
      throw new Error(`Quantity must be at least ${Quantity.MIN_QUANTITY}`);
    }

    if (value > Quantity.MAX_QUANTITY) {
      throw new Error(`Quantity cannot exceed ${Quantity.MAX_QUANTITY}`);
    }

    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }

  add(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }

  subtract(other: Quantity): Quantity {
    return new Quantity(this.value - other.value);
  }

  multiply(multiplier: number): Quantity {
    if (!Number.isInteger(multiplier) || multiplier < 0) {
      throw new Error("Multiplier must be a non-negative integer");
    }
    return new Quantity(this.value * multiplier);
  }

  isGreaterThan(other: Quantity): boolean {
    return this.value > other.value;
  }

  isLessThan(other: Quantity): boolean {
    return this.value < other.value;
  }

  isGreaterThanOrEqual(other: Quantity): boolean {
    return this.value >= other.value;
  }

  isLessThanOrEqual(other: Quantity): boolean {
    return this.value <= other.value;
  }

  static fromNumber(value: number): Quantity {
    return new Quantity(value);
  }

  static min(): Quantity {
    return new Quantity(Quantity.MIN_QUANTITY);
  }

  static max(): Quantity {
    return new Quantity(Quantity.MAX_QUANTITY);
  }
}