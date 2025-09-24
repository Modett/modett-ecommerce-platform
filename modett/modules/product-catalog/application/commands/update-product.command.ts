import { ProductManagementService } from '../services/product-management.service';
import { Product } from '../../domain/entities/product.entity';

// Base interfaces
export interface ICommand {
  readonly commandId?: string;
  readonly timestamp?: Date;
}

export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  handle(command: TCommand): Promise<TResult>;
}

export class CommandResult<T = any> {
  constructor(
    public success: boolean,
    public data?: T,
    public error?: string,
    public errors?: string[]
  ) {}

  static success<T>(data?: T): CommandResult<T> {
    return new CommandResult(true, data);
  }

  static failure<T>(error: string, errors?: string[]): CommandResult<T> {
    return new CommandResult<T>(false, undefined, error, errors);
  }
}

export interface UpdateProductCommand extends ICommand {
  productId: string;
  title?: string;
  brand?: string;
  shortDesc?: string;
  longDescHtml?: string;
  status?: 'draft' | 'published' | 'scheduled';
  publishAt?: Date;
  countryOfOrigin?: string;
  seoTitle?: string;
  seoDescription?: string;
  categoryIds?: string[];
  tags?: string[];
}

export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand, CommandResult<Product>> {
  constructor(
    private readonly productManagementService: ProductManagementService
  ) {}

  async handle(command: UpdateProductCommand): Promise<CommandResult<Product>> {
    try {
      // Validate command
      if (!command.productId) {
        return CommandResult.failure<Product>(
          'Product ID is required',
          ['productId']
        );
      }

      const updateData = {
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

      // Remove undefined values to avoid overwriting with undefined
      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      const product = await this.productManagementService.updateProduct(
        command.productId,
        filteredUpdateData
      );

      return CommandResult.success<Product>(product);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<Product>(
          'Product update failed',
          [error.message]
        );
      }

      return CommandResult.failure<Product>(
        'An unexpected error occurred during product update'
      );
    }
  }
}