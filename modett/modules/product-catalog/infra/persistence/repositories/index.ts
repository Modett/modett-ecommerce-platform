// Repository implementations
export { ProductRepository } from './product.repository.impl';
export { ProductVariantRepository } from './product-variant.repository.impl';
export { CategoryRepository } from './category.repository.impl';
export { MediaAssetRepository } from './media-asset.repository.impl';
export { ProductTagRepository } from './product-tag.repository.impl';

// Export repository interfaces from domain layer
export type { IProductRepository } from '../../../domain/repositories/product.repository';
export type { IProductVariantRepository } from '../../../domain/repositories/product-variant.repository';
export type { ICategoryRepository } from '../../../domain/repositories/category.repository';
export type { IMediaAssetRepository } from '../../../domain/repositories/media-asset.repository';
export type { IProductTagRepository } from '../../../domain/repositories/product-tag.repository';