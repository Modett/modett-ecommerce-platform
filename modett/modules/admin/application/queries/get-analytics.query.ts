import { IDashboardRepository } from "../../domain/repositories/dashboard.repository.interface";
import { AnalyticsOverview } from "../../domain/types";

// ============================================================================
// BASE CQRS DEFINITIONS (Internal)
// ============================================================================
export interface IQuery {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery, TResult = any> {
  handle(query: TQuery): Promise<QueryResult<TResult>>;
}

export class QueryResult<T> {
  constructor(
    public success: boolean,
    public data?: T,
    public error?: string,
    public errors?: string[]
  ) {}

  static success<T>(data: T): QueryResult<T> {
    return new QueryResult(true, data);
  }

  static failure<T>(error: string, errors?: string[]): QueryResult<T> {
    return new QueryResult<T>(false, undefined, error, errors);
  }
}

// ============================================================================
// QUERY: Get Analytics Overview
// ============================================================================
export class GetAnalyticsQuery implements IQuery {
  public readonly queryId?: string;
  public readonly timestamp?: Date;

  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly granularity: 'day' | 'week' | 'month' = 'day'
  ) {
    this.timestamp = new Date();
  }
}

// ============================================================================
// HANDLER: Get Analytics Overview
// ============================================================================
export class GetAnalyticsHandler
  implements IQueryHandler<GetAnalyticsQuery, AnalyticsOverview>
{
  constructor(private dashboardRepository: IDashboardRepository) {}

  async handle(
    query: GetAnalyticsQuery
  ): Promise<QueryResult<AnalyticsOverview>> {
    try {
      // Validate date range
      if (query.startDate > query.endDate) {
        return QueryResult.failure(
          "Start date must be before end date"
        );
      }

      const analytics = await this.dashboardRepository.getAnalyticsOverview(
        query.startDate,
        query.endDate,
        query.granularity
      );

      return QueryResult.success(analytics);
    } catch (error: any) {
      console.error("Failed to fetch analytics:", error);
      return QueryResult.failure("Failed to retrieve analytics data");
    }
  }
}
