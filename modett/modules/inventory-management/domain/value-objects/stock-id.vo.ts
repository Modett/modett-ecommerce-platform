// Stock ID is a composite key (variantId + locationId)
// We'll store it as a string representation for simplicity

export class StockId {
  private constructor(
    private readonly variantId: string,
    private readonly locationId: string
  ) {}

  static create(variantId: string, locationId: string): StockId {
    if (!variantId || !locationId) {
      throw new Error("Both variantId and locationId are required");
    }
    return new StockId(variantId, locationId);
  }

  getVariantId(): string {
    return this.variantId;
  }

  getLocationId(): string {
    return this.locationId;
  }

  equals(other: StockId): boolean {
    return (
      this.variantId === other.variantId &&
      this.locationId === other.locationId
    );
  }

  toString(): string {
    return `${this.variantId}:${this.locationId}`;
  }
}
