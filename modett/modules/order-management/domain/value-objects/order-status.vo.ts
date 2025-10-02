export enum OrderStatusEnum {
  CREATED = 'created',
  PAID = 'paid',
  FULFILLED = 'fulfilled',
  PARTIALLY_RETURNED = 'partially_returned',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export class OrderStatus {
  private readonly value: OrderStatusEnum;

  private constructor(value: OrderStatusEnum) {
    this.value = value;
  }

  static create(value: string): OrderStatus {
    const normalizedValue = value.toLowerCase();

    if (!Object.values(OrderStatusEnum).includes(normalizedValue as OrderStatusEnum)) {
      throw new Error(`Invalid order status: ${value}`);
    }

    return new OrderStatus(normalizedValue as OrderStatusEnum);
  }

  static created(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.CREATED);
  }

  static paid(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.PAID);
  }

  static fulfilled(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.FULFILLED);
  }

  static partiallyReturned(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.PARTIALLY_RETURNED);
  }

  static refunded(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.REFUNDED);
  }

  static cancelled(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.CANCELLED);
  }

  getValue(): OrderStatusEnum {
    return this.value;
  }

  isCreated(): boolean {
    return this.value === OrderStatusEnum.CREATED;
  }

  isPaid(): boolean {
    return this.value === OrderStatusEnum.PAID;
  }

  isFulfilled(): boolean {
    return this.value === OrderStatusEnum.FULFILLED;
  }

  isPartiallyReturned(): boolean {
    return this.value === OrderStatusEnum.PARTIALLY_RETURNED;
  }

  isRefunded(): boolean {
    return this.value === OrderStatusEnum.REFUNDED;
  }

  isCancelled(): boolean {
    return this.value === OrderStatusEnum.CANCELLED;
  }

  canTransitionTo(newStatus: OrderStatus): boolean {
    const transitions: Record<OrderStatusEnum, OrderStatusEnum[]> = {
      [OrderStatusEnum.CREATED]: [OrderStatusEnum.PAID, OrderStatusEnum.CANCELLED],
      [OrderStatusEnum.PAID]: [OrderStatusEnum.FULFILLED, OrderStatusEnum.REFUNDED, OrderStatusEnum.CANCELLED],
      [OrderStatusEnum.FULFILLED]: [OrderStatusEnum.PARTIALLY_RETURNED, OrderStatusEnum.REFUNDED],
      [OrderStatusEnum.PARTIALLY_RETURNED]: [OrderStatusEnum.REFUNDED],
      [OrderStatusEnum.REFUNDED]: [],
      [OrderStatusEnum.CANCELLED]: []
    };

    return transitions[this.value].includes(newStatus.value);
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
