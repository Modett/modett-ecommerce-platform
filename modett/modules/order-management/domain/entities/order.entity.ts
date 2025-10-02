import {
  OrderId,
  OrderNumber,
  OrderStatus,
  OrderSource,
  Currency,
  OrderTotals
} from '../value-objects';

export interface OrderProps {
  orderId: OrderId;
  orderNumber: OrderNumber;
  userId?: string;
  guestToken?: string;
  totals: OrderTotals;
  status: OrderStatus;
  source: OrderSource;
  currency: Currency;
  createdAt: Date;
  updatedAt: Date;
}

export class Order {
  private orderId: OrderId;
  private orderNumber: OrderNumber;
  private userId?: string;
  private guestToken?: string;
  private totals: OrderTotals;
  private status: OrderStatus;
  private source: OrderSource;
  private currency: Currency;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: OrderProps) {
    this.orderId = props.orderId;
    this.orderNumber = props.orderNumber;
    this.userId = props.userId;
    this.guestToken = props.guestToken;
    this.totals = props.totals;
    this.status = props.status;
    this.source = props.source;
    this.currency = props.currency;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<OrderProps, 'orderId' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    if (!props.userId && !props.guestToken) {
      throw new Error('Order must have either userId or guestToken');
    }

    if (props.userId && props.guestToken) {
      throw new Error('Order cannot have both userId and guestToken');
    }

    return new Order({
      orderId: OrderId.generate(),
      orderNumber: OrderNumber.generate(),
      userId: props.userId,
      guestToken: props.guestToken,
      totals: props.totals,
      status: props.status,
      source: props.source,
      currency: props.currency,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static reconstitute(props: OrderProps): Order {
    return new Order(props);
  }

  getOrderId(): OrderId {
    return this.orderId;
  }

  getOrderNumber(): OrderNumber {
    return this.orderNumber;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  getGuestToken(): string | undefined {
    return this.guestToken;
  }

  getTotals(): OrderTotals {
    return this.totals;
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getSource(): OrderSource {
    return this.source;
  }

  getCurrency(): Currency {
    return this.currency;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  isGuestOrder(): boolean {
    return !!this.guestToken;
  }

  isUserOrder(): boolean {
    return !!this.userId;
  }

  updateTotals(totals: OrderTotals): void {
    this.totals = totals;
    this.updatedAt = new Date();
  }

  changeStatus(newStatus: OrderStatus): void {
    if (!this.status.canTransitionTo(newStatus)) {
      throw new Error(`Cannot transition from ${this.status.getValue()} to ${newStatus.getValue()}`);
    }

    this.status = newStatus;
    this.updatedAt = new Date();
  }

  markAsPaid(): void {
    this.changeStatus(OrderStatus.paid());
  }

  markAsFulfilled(): void {
    this.changeStatus(OrderStatus.fulfilled());
  }

  cancel(): void {
    this.changeStatus(OrderStatus.cancelled());
  }

  refund(): void {
    this.changeStatus(OrderStatus.refunded());
  }
}
