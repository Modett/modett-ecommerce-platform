// Base interfaces
export { IQuery, IQueryHandler, QueryResult } from './Query';

// Product queries
export { GetProductQuery } from './GetProductQuery';
export { ListProductsQuery, ProductListResult } from './ListProductsQuery';
export { SearchProductsQuery, ProductSearchResult } from './SearchProductsQuery';

// Product query handlers
export { GetProductQueryHandler } from './GetProductQueryHandler';
export { ListProductsQueryHandler } from './ListProductsQueryHandler';
export { SearchProductsQueryHandler } from './SearchProductsQueryHandler';