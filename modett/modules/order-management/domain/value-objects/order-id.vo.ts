import { randomUUID } from 'crypto';

export class OrderId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): OrderId {
    if (!value || value.trim().length === 0) {
      throw new Error('Order ID cannot be empty');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('Order ID must be a valid UUID');
    }

    return new OrderId(value);
  }

  static generate(): OrderId {
    return new OrderId(randomUUID());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: OrderId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
