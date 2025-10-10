import { BackorderManagementService } from '../services/backorder-management.service';
import { Backorder } from '../../domain/entities/backorder.entity';
import { CommandResult } from '../commands/create-backorder.command';

// Query interfaces
export interface IQuery {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery, TResult = any> {
  handle(query: TQuery): Promise<TResult>;
}

export interface GetBackorderQuery extends IQuery {
  orderItemId: string;
}

export interface BackorderResult {
  orderItemId: string;
  promisedEta?: Date;
  notifiedAt?: Date;
  hasPromisedEta: boolean;
  isCustomerNotified: boolean;
}

export class GetBackorderHandler implements IQueryHandler<GetBackorderQuery, CommandResult<BackorderResult>> {
  constructor(
    private readonly backorderService: BackorderManagementService
  ) {}

  async handle(query: GetBackorderQuery): Promise<CommandResult<BackorderResult>> {
    try {
      // Validate orderItemId
      if (!query.orderItemId || query.orderItemId.trim().length === 0) {
        return CommandResult.failure<BackorderResult>(
          'Order item ID is required',
          ['orderItemId']
        );
      }

      // Get backorder
      const backorder = await this.backorderService.getBackorderByOrderItemId(query.orderItemId);

      if (!backorder) {
        return CommandResult.failure<BackorderResult>(
          'Backorder not found'
        );
      }

      const result: BackorderResult = {
        orderItemId: backorder.getOrderItemId(),
        promisedEta: backorder.getPromisedEta(),
        notifiedAt: backorder.getNotifiedAt(),
        hasPromisedEta: backorder.hasPromisedEta(),
        isCustomerNotified: backorder.isCustomerNotified(),
      };

      return CommandResult.success<BackorderResult>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<BackorderResult>(
          'Failed to retrieve backorder',
          [error.message]
        );
      }

      return CommandResult.failure<BackorderResult>(
        'An unexpected error occurred while retrieving backorder'
      );
    }
  }
}
