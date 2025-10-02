export interface OrderEventProps {
  eventId: number;
  orderId: string;
  eventType: string;
  payload: Record<string, any>;
  createdAt: Date;
}

export class OrderEvent {
  private eventId: number;
  private orderId: string;
  private eventType: string;
  private payload: Record<string, any>;
  private createdAt: Date;

  private constructor(props: OrderEventProps) {
    this.eventId = props.eventId;
    this.orderId = props.orderId;
    this.eventType = props.eventType;
    this.payload = props.payload;
    this.createdAt = props.createdAt;
  }

  static create(props: Omit<OrderEventProps, 'eventId' | 'createdAt'>): OrderEvent {
    if (!props.eventType || props.eventType.trim().length === 0) {
      throw new Error('Event type is required');
    }

    return new OrderEvent({
      eventId: 0, // Will be assigned by database
      orderId: props.orderId,
      eventType: props.eventType,
      payload: props.payload,
      createdAt: new Date()
    });
  }

  static reconstitute(props: OrderEventProps): OrderEvent {
    return new OrderEvent(props);
  }

  getEventId(): number {
    return this.eventId;
  }

  getOrderId(): string {
    return this.orderId;
  }

  getEventType(): string {
    return this.eventType;
  }

  getPayload(): Record<string, any> {
    return this.payload;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
