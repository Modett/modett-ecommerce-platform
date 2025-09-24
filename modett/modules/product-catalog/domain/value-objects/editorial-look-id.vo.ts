import { v4 as uuidv4 } from 'uuid';

export class EditorialLookId {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error('Editorial Look ID cannot be empty');
    }

    if (!this.isValidUuid(value)) {
      throw new Error('Editorial Look ID must be a valid UUID');
    }
  }

  static create(): EditorialLookId {
    return new EditorialLookId(uuidv4());
  }

  static fromString(value: string): EditorialLookId {
    return new EditorialLookId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: EditorialLookId): boolean {
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