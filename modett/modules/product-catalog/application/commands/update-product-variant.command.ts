import { VariantManagementService } from '../services/variant-management.service';
import { ProductVariant } from '../../domain/entities/product-variant.entity';
import { ICommand, ICommandHandler, CommandResult } from './create-product.command';

export interface UpdateProductVariantCommand extends ICommand {
  variantId: string;
  sku?: string;
  size?: string;
  color?: string;
  barcode?: string;
  price?: number;
  compareAtPrice?: number;
  weightG?: number;
  dims?: {
    length?: number;
    width?: number;
    height?: number;
  };
  taxClass?: string;
  allowBackorder?: boolean;
  allowPreorder?: boolean;
  restockEta?: Date;
}

export class UpdateProductVariantHandler implements ICommandHandler<UpdateProductVariantCommand, CommandResult<ProductVariant>> {
  constructor(
    private readonly variantManagementService: VariantManagementService
  ) {}

  async handle(command: UpdateProductVariantCommand): Promise<CommandResult<ProductVariant>> {
    try {
      if (!command.variantId) {
        return CommandResult.failure<ProductVariant>(
          'Variant ID is required',
          ['variantId']
        );
      }

      if (command.price != null && command.price < 0) {
        return CommandResult.failure<ProductVariant>(
          'Price must be >= 0',
          ['price']
        );
      }

      if (command.compareAtPrice != null && command.compareAtPrice < 0) {
        return CommandResult.failure<ProductVariant>(
          'Compare at price must be >= 0',
          ['compareAtPrice']
        );
      }

      const updateData = {
        sku: command.sku,
        size: command.size,
        color: command.color,
        barcode: command.barcode,
        price: command.price,
        compareAtPrice: command.compareAtPrice,
        weightG: command.weightG,
        dims: command.dims,
        taxClass: command.taxClass,
        allowBackorder: command.allowBackorder,
        allowPreorder: command.allowPreorder,
        restockEta: command.restockEta
      };

      const filteredUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      const variant = await this.variantManagementService.updateVariant(command.variantId, filteredUpdateData);

      if (!variant) {
        return CommandResult.failure<ProductVariant>(
          'Variant not found or update failed'
        );
      }

      return CommandResult.success<ProductVariant>(variant);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<ProductVariant>(
          'Variant update failed',
          [error.message]
        );
      }

      return CommandResult.failure<ProductVariant>(
        'An unexpected error occurred during variant update'
      );
    }
  }
}