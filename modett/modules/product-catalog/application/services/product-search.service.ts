import { IProductRepository } from '../../domain/repositories/product.repository';
import { ICategoryRepository } from '../../domain/repositories/category.repository';

export class ProductSearchService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async searchProducts(query: string, options?: any) {
    // TODO: Implement product search
    throw new Error('ProductSearchService.searchProducts not yet implemented');
  }
}