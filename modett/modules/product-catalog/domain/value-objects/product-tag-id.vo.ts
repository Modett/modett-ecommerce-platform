import { v4 as uuidv4 } from 'uuid';

export class ProductTagId {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error('Product Tag ID cannot be empty');
    }

    if (!this.isValidUuid(value)) {
      throw new Error('Product Tag ID must be a valid UUID');
    }
  }

  static create(): ProductTagId {
    return new ProductTagId(uuidv4());
  }

  static fromString(value: string): ProductTagId {
    return new ProductTagId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProductTagId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}