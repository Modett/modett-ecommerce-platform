import { randomUUID } from "crypto";

export class UserId {
  private constructor(private readonly value: string) {}

  static create(id?: string): UserId {
    if (id) {
      if (!this.isValidUUID(id)) {
        throw new Error("Invalid UUID format");
      }
      return new UserId(id);
    }

    return new UserId(randomUUID());
  }

  static fromString(id: string): UserId {
    if (!this.isValidUUID(id)) {
      throw new Error("Invalid UUID format");
    }
    return new UserId(id);
  }

  private static isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
