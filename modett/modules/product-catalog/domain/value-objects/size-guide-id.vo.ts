import { v4 as uuidv4 } from 'uuid';

export class SizeGuideId {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error('Size Guide ID cannot be empty');
    }

    if (!this.isValidUuid(value)) {
      throw new Error('Size Guide ID must be a valid UUID');
    }
  }

  static create(): SizeGuideId {
    return new SizeGuideId(uuidv4());
  }

  static fromString(value: string): SizeGuideId {
    return new SizeGuideId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: SizeGuideId): boolean {
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