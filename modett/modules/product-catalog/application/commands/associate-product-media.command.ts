import { ProductMediaManagementService } from '../services/product-media-management.service';
import { ProductMedia } from '../../domain/entities/product-media.entity';
import { ICommand, ICommandHandler, CommandResult } from './create-product.command';

export interface AssociateProductMediaCommand extends ICommand {
  productId: string;
  assetId: string;
  position?: number;
  isCover?: boolean;
}

export class AssociateProductMediaHandler implements ICommandHandler<AssociateProductMediaCommand, CommandResult<ProductMedia>> {
  constructor(
    private readonly productMediaService: ProductMediaManagementService
  ) {}

  async handle(command: AssociateProductMediaCommand): Promise<CommandResult<ProductMedia>> {
    try {
      if (!command.productId) {
        return CommandResult.failure<ProductMedia>(
          'Product ID is required',
          ['productId']
        );
      }

      if (!command.assetId) {
        return CommandResult.failure<ProductMedia>(
          'Asset ID is required',
          ['assetId']
        );
      }

      const mediaData = {
        productId: command.productId,
        assetId: command.assetId,
        position: command.position,
        isCover: command.isCover || false
      };

      const productMedia = await this.productMediaService.associateMedia(mediaData);
      return CommandResult.success<ProductMedia>(productMedia);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<ProductMedia>(
          'Product media association failed',
          [error.message]
        );
      }

      return CommandResult.failure<ProductMedia>(
        'An unexpected error occurred during product media association'
      );
    }
  }
}