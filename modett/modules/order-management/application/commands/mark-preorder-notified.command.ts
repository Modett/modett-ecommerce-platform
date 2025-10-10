import { PreorderManagementService } from '../services/preorder-management.service';
import { Preorder } from '../../domain/entities/preorder.entity';
import { CommandResult } from './create-preorder.command';

export interface ICommand {
  readonly commandId?: string;
  readonly timestamp?: Date;
}

export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  handle(command: TCommand): Promise<TResult>;
}

export interface MarkPreorderNotifiedCommand extends ICommand {
  orderItemId: string;
}

export class MarkPreorderNotifiedCommandHandler
  implements ICommandHandler<MarkPreorderNotifiedCommand, CommandResult<Preorder>>
{
  constructor(private readonly preorderService: PreorderManagementService) {}

  async handle(
    command: MarkPreorderNotifiedCommand
  ): Promise<CommandResult<Preorder>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!command.orderItemId || command.orderItemId.trim().length === 0) {
        errors.push('orderItemId: Order item ID is required');
      }

      if (errors.length > 0) {
        return CommandResult.failure<Preorder>('Validation failed', errors);
      }

      // Execute service
      const preorder = await this.preorderService.markAsNotified(
        command.orderItemId
      );

      if (!preorder) {
        return CommandResult.failure<Preorder>('Preorder not found');
      }

      return CommandResult.success(preorder);
    } catch (error) {
      return CommandResult.failure<Preorder>(
        error instanceof Error ? error.message : 'Unknown error occurred',
        [error instanceof Error ? error.message : 'Unknown error']
      );
    }
  }
}

// Alias for backwards compatibility
export { MarkPreorderNotifiedCommandHandler as MarkPreorderNotifiedHandler };
