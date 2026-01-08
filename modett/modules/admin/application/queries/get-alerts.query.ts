import { IDashboardRepository } from "../../domain/repositories/dashboard.repository.interface";
import { DashboardAlerts } from "../../domain/types";

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
// QUERY: Get Alerts
// ============================================================================
export class GetAlertsQuery implements IQuery {}

// ============================================================================
// HANDLER: Get Alerts
// ============================================================================
export class GetAlertsHandler
  implements IQueryHandler<GetAlertsQuery, DashboardAlerts>
{
  constructor(private dashboardRepository: IDashboardRepository) {}

  async handle(query: GetAlertsQuery): Promise<QueryResult<DashboardAlerts>> {
    try {
      const alerts = await this.dashboardRepository.getAlerts();
      return QueryResult.success(alerts);
    } catch (error: any) {
      console.error("Failed to fetch alerts:", error);
      return QueryResult.failure("Failed to retrieve dashboard alerts");
    }
  }
}
