import { IProductVariantRepository } from '../../domain/repositories/product-variant.repository';
import { IProductRepository } from '../../domain/repositories/product.repository';

export class VariantManagementService {
  constructor(
    private readonly productVariantRepository: IProductVariantRepository,
    private readonly productRepository: IProductRepository
  ) {}

  // TODO: Implement variant management methods
}