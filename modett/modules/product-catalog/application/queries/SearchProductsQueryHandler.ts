import { IQueryHandler, QueryResult } from './Query';
import { SearchProductsQuery, ProductSearchResult } from './SearchProductsQuery';
import { ProductManagementService } from '../services/product-management.service';

export class SearchProductsQueryHandler implements IQueryHandler<SearchProductsQuery, QueryResult<ProductSearchResult>> {
  constructor(
    private readonly productManagementService: ProductManagementService
  ) {}

  async handle(query: SearchProductsQuery): Promise<QueryResult<ProductSearchResult>> {
    try {
      // Validate query
      if (!query.searchTerm || query.searchTerm.trim().length === 0) {
        return QueryResult.failure<ProductSearchResult>('Search term is required');
      }

      if (query.page < 1) {
        return QueryResult.failure<ProductSearchResult>('Page must be greater than 0');
      }

      if (query.limit < 1 || query.limit > 100) {
        return QueryResult.failure<ProductSearchResult>('Limit must be between 1 and 100');
      }

      const searchOptions = {
        searchTerm: query.searchTerm.trim(),
        page: query.page,
        limit: query.limit,
        ...query.filters
      };

      const result = await this.productManagementService.searchProducts(searchOptions);

      const searchResult: ProductSearchResult = {
        products: result.products,
        total: result.total,
        query: query.searchTerm,
        page: query.page,
        limit: query.limit
      };

      return QueryResult.success<ProductSearchResult>(searchResult);
    } catch (error) {
      if (error instanceof Error) {
        return QueryResult.failure<ProductSearchResult>(
          `Product search failed: ${error.message}`
        );
      }

      return QueryResult.failure<ProductSearchResult>(
        'An unexpected error occurred during product search'
      );
    }
  }
}