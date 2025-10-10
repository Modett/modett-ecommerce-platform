import { PreorderManagementService } from '../services/preorder-management.service';
import { Preorder } from '../../domain/entities/preorder.entity';
import { CommandResult } from '../commands/create-preorder.command';

// Query interfaces
export interface IQuery {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery, TResult = any> {
  handle(query: TQuery): Promise<TResult>;
}

export interface GetPreorderQuery extends IQuery {
  orderItemId: string;
}

export interface PreorderResult {
  orderItemId: string;
  releaseDate?: Date;
  notifiedAt?: Date;
  hasReleaseDate: boolean;
  isCustomerNotified: boolean;
  isReleased: boolean;
}

export class GetPreorderHandler implements IQueryHandler<GetPreorderQuery, CommandResult<PreorderResult>> {
  constructor(
    private readonly preorderService: PreorderManagementService
  ) {}

  async handle(query: GetPreorderQuery): Promise<CommandResult<PreorderResult>> {
    try {
      // Validate orderItemId
      if (!query.orderItemId || query.orderItemId.trim().length === 0) {
        return CommandResult.failure<PreorderResult>(
          'Order item ID is required',
          ['orderItemId']
        );
      }

      // Get preorder
      const preorder = await this.preorderService.getPreorderByOrderItemId(query.orderItemId);

      if (!preorder) {
        return CommandResult.failure<PreorderResult>(
          'Preorder not found'
        );
      }

      const result: PreorderResult = {
        orderItemId: preorder.getOrderItemId(),
        releaseDate: preorder.getReleaseDate(),
        notifiedAt: preorder.getNotifiedAt(),
        hasReleaseDate: preorder.hasReleaseDate(),
        isCustomerNotified: preorder.isCustomerNotified(),
        isReleased: preorder.isReleased(),
      };

      return CommandResult.success<PreorderResult>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<PreorderResult>(
          'Failed to retrieve preorder',
          [error.message]
        );
      }

      return CommandResult.failure<PreorderResult>(
        'An unexpected error occurred while retrieving preorder'
      );
    }
  }
}
