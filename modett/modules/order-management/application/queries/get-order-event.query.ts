import { OrderEventService } from "../services/order-event.service";

export interface IQuery {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery, TResult> {
  handle(query: TQuery): Promise<TResult>;
}

export class QueryResult<T = any> {
  constructor(
    public success: boolean,
    public data?: T,
    public error?: string
  ) {}

  static success<T>(data: T): QueryResult<T> {
    return new QueryResult(true, data);
  }

  static failure<T>(error: string): QueryResult<T> {
    return new QueryResult<T>(false, undefined, error);
  }
}

export interface OrderEventResult {
  eventId: number;
  orderId: string;
  eventType: string;
  payload: Record<string, any>;
  createdAt: Date;
}

export interface GetOrderEventQuery extends IQuery {
  eventId: number;
}

export class GetOrderEventHandler
  implements IQueryHandler<GetOrderEventQuery, QueryResult<OrderEventResult | null>>
{
  constructor(private readonly orderEventService: OrderEventService) {}

  async handle(
    query: GetOrderEventQuery
  ): Promise<QueryResult<OrderEventResult | null>> {
    try {
      if (query.eventId === undefined || query.eventId === null || query.eventId < 0) {
        return QueryResult.failure("Valid event ID is required");
      }

      const event = await this.orderEventService.getEventById(query.eventId);

      if (!event) {
        return QueryResult.failure("Event not found");
      }

      // Convert entity to plain object
      const result: OrderEventResult = {
        eventId: event.getEventId(),
        orderId: event.getOrderId(),
        eventType: event.getEventType(),
        payload: event.getPayload(),
        createdAt: event.getCreatedAt(),
      };

      return QueryResult.success(result);
    } catch (error) {
      return QueryResult.failure(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
}
