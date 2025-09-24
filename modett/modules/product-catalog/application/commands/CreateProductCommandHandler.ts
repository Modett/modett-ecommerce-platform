import { ICommandHandler, CommandResult } from './Command';
import { CreateProductCommand } from './CreateProductCommand';
import { Product } from '../../domain/entities/product.entity';
import { ProductManagementService } from '../services/product-management.service';

export class CreateProductCommandHandler implements ICommandHandler<CreateProductCommand, CommandResult<Product>> {
  constructor(
    private readonly productManagementService: ProductManagementService
  ) {}

  async handle(command: CreateProductCommand): Promise<CommandResult<Product>> {
    try {
      // Validate command
      if (!command.title) {
        return CommandResult.failure<Product>(
          'Product title is required',
          ['title']
        );
      }

      const productData = {
        title: command.title,
        brand: command.brand,
        shortDesc: command.shortDesc,
        longDescHtml: command.longDescHtml,
        status: command.status,
        publishAt: command.publishAt,
        countryOfOrigin: command.countryOfOrigin,
        seoTitle: command.seoTitle,
        seoDescription: command.seoDescription,
        categoryIds: command.categoryIds,
        tags: command.tags
      };

      const product = await this.productManagementService.createProduct(productData);
      return CommandResult.success<Product>(product);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<Product>(
          'Product creation failed',
          [error.message]
        );
      }

      return CommandResult.failure<Product>(
        'An unexpected error occurred during product creation'
      );
    }
  }
}