import { VariantManagementService } from '../services/variant-management.service';
import { ProductVariant } from '../../domain/entities/product-variant.entity';

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

export interface CreateProductVariantCommand extends ICommand {
  productId: string;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  inventoryQuantity?: number;
  inventoryPolicy?: 'deny' | 'continue';
  requiresShipping?: boolean;
  barcode?: string;
  isActive?: boolean;
}

export class CreateProductVariantHandler implements ICommandHandler<CreateProductVariantCommand, CommandResult<ProductVariant>> {
  constructor(
    private readonly variantManagementService: VariantManagementService
  ) {}

  async handle(command: CreateProductVariantCommand): Promise<CommandResult<ProductVariant>> {
    try {
      // Validate command
      if (!command.productId) {
        return CommandResult.failure<ProductVariant>(
          'Product ID is required',
          ['productId']
        );
      }

      if (!command.sku) {
        return CommandResult.failure<ProductVariant>(
          'SKU is required',
          ['sku']
        );
      }

      if (!command.price || command.price < 0) {
        return CommandResult.failure<ProductVariant>(
          'Valid price is required',
          ['price']
        );
      }

      const variantData = {
        productId: command.productId,
        sku: command.sku,
        size: command.size,
        color: command.color,
        material: command.material,
        price: command.price,
        compareAtPrice: command.compareAtPrice,
        costPrice: command.costPrice,
        weight: command.weight,
        dimensions: command.dimensions,
        inventoryQuantity: command.inventoryQuantity || 0,
        inventoryPolicy: command.inventoryPolicy || 'deny',
        requiresShipping: command.requiresShipping ?? true,
        barcode: command.barcode,
        isActive: command.isActive ?? true
      };

      const variant = await this.variantManagementService.createVariant(variantData);
      return CommandResult.success<ProductVariant>(variant);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<ProductVariant>(
          'Variant creation failed',
          [error.message]
        );
      }

      return CommandResult.failure<ProductVariant>(
        'An unexpected error occurred during variant creation'
      );
    }
  }
}