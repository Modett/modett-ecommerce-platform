export class Price {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error('Price cannot be negative');
    }

    if (!Number.isFinite(value)) {
      throw new Error('Price must be a finite number');
    }

    // Ensure price has at most 2 decimal places
    if (Number(value.toFixed(2)) !== value) {
      throw new Error('Price cannot have more than 2 decimal places');
    }
  }

  static create(value: number): Price {
    return new Price(value);
  }

  static fromString(value: string): Price {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      throw new Error('Invalid price format');
    }
    return new Price(numValue);
  }

  getValue(): number {
    return this.value;
  }

  getValueInCents(): number {
    return Math.round(this.value * 100);
  }

  equals(other: Price): boolean {
    return this.value === other.value;
  }

  isGreaterThan(other: Price): boolean {
    return this.value > other.value;
  }

  isLessThan(other: Price): boolean {
    return this.value < other.value;
  }

  add(other: Price): Price {
    return new Price(this.value + other.value);
  }

  subtract(other: Price): Price {
    return new Price(this.value - other.value);
  }

  multiply(factor: number): Price {
    return new Price(this.value * factor);
  }

  applyDiscount(percentage: number): Price {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }
    const discountAmount = this.value * (percentage / 100);
    return new Price(this.value - discountAmount);
  }

  toString(): string {
    return this.value.toFixed(2);
  }

  toDisplayString(currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(this.value);
  }
}