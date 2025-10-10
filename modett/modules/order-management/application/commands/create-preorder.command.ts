import { PreorderManagementService } from '../services/preorder-management.service';
import { Preorder } from '../../domain/entities/preorder.entity';

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

export interface CreatePreorderCommand extends ICommand {
  orderItemId: string;
  releaseDate?: Date;
}

export class CreatePreorderCommandHandler
  implements ICommandHandler<CreatePreorderCommand, CommandResult<Preorder>>
{
  constructor(private readonly preorderService: PreorderManagementService) {}

  async handle(
    command: CreatePreorderCommand
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
      const preorder = await this.preorderService.createPreorder({
        orderItemId: command.orderItemId,
        releaseDate: command.releaseDate,
      });

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
export { CreatePreorderCommandHandler as CreatePreorderHandler };
