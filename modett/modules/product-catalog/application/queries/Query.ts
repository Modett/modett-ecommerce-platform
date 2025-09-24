export interface IQuery<TResult = any> {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult = any> {
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