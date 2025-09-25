import { ProductManagementService } from '../services/product-management.service';
import { Product } from '../../domain/entities/product.entity';
import { CommandResult } from '../commands/create-product.command';

// Query interfaces
export interface IQuery {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery, TResult = any> {
  handle(query: TQuery): Promise<TResult>;
}

export interface GetProductQuery extends IQuery {
  productId: string;
}

export interface ProductResult {
  productId: string;
  title: string;
  slug: string;
  brand?: string;
  shortDesc?: string;
  longDescHtml?: string;
  status: string;
  publishAt?: Date;
  countryOfOrigin?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetProductHandler implements IQueryHandler<GetProductQuery, CommandResult<ProductResult>> {
  constructor(
    private readonly productManagementService: ProductManagementService
  ) {}

  async handle(query: GetProductQuery): Promise<CommandResult<ProductResult>> {
    try {
      if (!query.productId) {
        return CommandResult.failure<ProductResult>(
          'Product ID is required',
          ['productId']
        );
      }

      const product = await this.productManagementService.getProductById(query.productId);

      if (!product) {
        return CommandResult.failure<ProductResult>(
          'Product not found'
        );
      }

      const result: ProductResult = {
        productId: product.getId().toString(),
        title: product.getTitle(),
        slug: product.getSlug().toString(),
        brand: product.getBrand() ?? undefined,
        shortDesc: product.getShortDesc() ?? undefined,
        longDescHtml: product.getLongDescHtml() ?? undefined,
        status: product.getStatus(),
        publishAt: product.getPublishAt() ?? undefined,
        countryOfOrigin: product.getCountryOfOrigin() ?? undefined,
        seoTitle: product.getSeoTitle() ?? undefined,
        seoDescription: product.getSeoDescription() ?? undefined,
        createdAt: product.getCreatedAt(),
        updatedAt: product.getUpdatedAt()
      };

      return CommandResult.success<ProductResult>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<ProductResult>(
          'Failed to retrieve product',
          [error.message]
        );
      }

      return CommandResult.failure<ProductResult>(
        'An unexpected error occurred while retrieving product'
      );
    }
  }
}