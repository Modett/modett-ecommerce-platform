import { v4 as uuidv4 } from 'uuid';

export class MediaAssetId {
  private constructor(private readonly value: string) {
    if (!value) {
      throw new Error('Media Asset ID cannot be empty');
    }

    if (!this.isValidUuid(value)) {
      throw new Error('Media Asset ID must be a valid UUID');
    }
  }

  static create(): MediaAssetId {
    return new MediaAssetId(uuidv4());
  }

  static fromString(value: string): MediaAssetId {
    return new MediaAssetId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: MediaAssetId): boolean {
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