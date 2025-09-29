export class VariantId {
  private readonly value: string;

  constructor(value: string) {
    if (!value) {
      throw new Error("Variant ID is required");
    }

    if (!this.isValidUuid(value)) {
      throw new Error("Invalid Variant ID format. Must be a valid UUID.");
    }

    this.value = value;
  }

  private isValidUuid(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: VariantId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static fromString(value: string): VariantId {
    return new VariantId(value);
  }
}
