import { IDashboardRepository } from "../../domain/repositories/dashboard.repository.interface";
import { ActivityItem } from "../../domain/types";

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
// QUERY: Get Recent Activity
// ============================================================================
export class GetRecentActivityQuery implements IQuery {}

// ============================================================================
// HANDLER: Get Recent Activity
// ============================================================================
export class GetRecentActivityHandler
  implements IQueryHandler<GetRecentActivityQuery, ActivityItem[]>
{
  constructor(private dashboardRepository: IDashboardRepository) {}

  async handle(
    query: GetRecentActivityQuery
  ): Promise<QueryResult<ActivityItem[]>> {
    try {
      const activity = await this.dashboardRepository.getRecentActivity();
      return QueryResult.success(activity);
    } catch (error: any) {
      console.error("Failed to fetch recent activity:", error);
      return QueryResult.failure("Failed to retrieve dashboard activity");
    }
  }
}
