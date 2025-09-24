import { IQueryHandler, QueryResult } from './Query';
import { GetProductQuery } from './GetProductQuery';
import { Product } from '../../domain/entities/product.entity';
import { ProductManagementService } from '../services/product-management.service';

export class GetProductQueryHandler implements IQueryHandler<GetProductQuery, QueryResult<Product>> {
  constructor(
    private readonly productManagementService: ProductManagementService
  ) {}

  async handle(query: GetProductQuery): Promise<QueryResult<Product>> {
    try {
      // Validate query
      if (!query.productId) {
        return QueryResult.failure<Product>('Product ID is required');
      }

      const product = await this.productManagementService.getProductById(query.productId);
      return QueryResult.success<Product>(product);
    } catch (error) {
      if (error instanceof Error) {
        return QueryResult.failure<Product>(
          `Failed to get product: ${error.message}`
        );
      }

      return QueryResult.failure<Product>(
        'An unexpected error occurred while retrieving the product'
      );
    }
  }
}