import { IQueryHandler, QueryResult } from './Query';
import { ListProductsQuery, ProductListResult } from './ListProductsQuery';
import { ProductManagementService } from '../services/product-management.service';

export class ListProductsQueryHandler implements IQueryHandler<ListProductsQuery, QueryResult<ProductListResult>> {
  constructor(
    private readonly productManagementService: ProductManagementService
  ) {}

  async handle(query: ListProductsQuery): Promise<QueryResult<ProductListResult>> {
    try {
      // Validate query
      if (query.page < 1) {
        return QueryResult.failure<ProductListResult>('Page must be greater than 0');
      }

      if (query.limit < 1 || query.limit > 100) {
        return QueryResult.failure<ProductListResult>('Limit must be between 1 and 100');
      }

      const queryOptions = {
        page: query.page,
        limit: query.limit,
        status: query.status,
        categoryId: query.categoryId,
        brand: query.brand,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder
      };

      // Remove undefined values
      const filteredOptions = Object.fromEntries(
        Object.entries(queryOptions).filter(([_, value]) => value !== undefined)
      );

      const result = await this.productManagementService.getProducts(filteredOptions);

      const productListResult: ProductListResult = {
        products: result.products,
        total: result.total,
        page: query.page,
        limit: query.limit
      };

      return QueryResult.success<ProductListResult>(productListResult);
    } catch (error) {
      if (error instanceof Error) {
        return QueryResult.failure<ProductListResult>(
          `Failed to list products: ${error.message}`
        );
      }

      return QueryResult.failure<ProductListResult>(
        'An unexpected error occurred while listing products'
      );
    }
  }
}