import { IDashboardRepository } from "../../domain/repositories/dashboard.repository.interface";
import { DashboardSummary } from "../../domain/types";

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
// QUERY: Get Daily Stats
// ============================================================================
export class GetDailyStatsQuery implements IQuery {}

// ============================================================================
// HANDLER: Get Daily Stats
// ============================================================================
export class GetDailyStatsHandler
  implements IQueryHandler<GetDailyStatsQuery, DashboardSummary>
{
  constructor(private dashboardRepository: IDashboardRepository) {}

  async handle(
    query: GetDailyStatsQuery
  ): Promise<QueryResult<DashboardSummary>> {
    try {
      const stats = await this.dashboardRepository.getDailyStats();
      return QueryResult.success(stats);
    } catch (error: any) {
      console.error("Failed to fetch daily stats:", error);
      return QueryResult.failure("Failed to retrieve dashboard statistics");
    }
  }
}
