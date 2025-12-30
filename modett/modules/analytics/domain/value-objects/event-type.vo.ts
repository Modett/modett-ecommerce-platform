export class EventType {
  private static readonly VALID_TYPES = ['product_view', 'purchase'] as const;
  private readonly value: typeof EventType.VALID_TYPES[number];

  private constructor(value: typeof EventType.VALID_TYPES[number]) {
    this.value = value;
  }

  static productView(): EventType {
    return new EventType('product_view');
  }

  static purchase(): EventType {
    return new EventType('purchase');
  }

  static create(type: string): EventType {
    if (!EventType.VALID_TYPES.includes(type as any)) {
      throw new Error(`Invalid event type: ${type}. Must be one of: ${EventType.VALID_TYPES.join(', ')}`);
    }
    return new EventType(type as typeof EventType.VALID_TYPES[number]);
  }

  getValue(): string {
    return this.value;
  }

  isProductView(): boolean {
    return this.value === 'product_view';
  }

  isPurchase(): boolean {
    return this.value === 'purchase';
  }

  equals(other: EventType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
