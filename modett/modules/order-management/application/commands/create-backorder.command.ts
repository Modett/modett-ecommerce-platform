import { BackorderManagementService } from '../services/backorder-management.service';
import { Backorder } from '../../domain/entities/backorder.entity';

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

export interface CreateBackorderCommand extends ICommand {
  orderItemId: string;
  promisedEta?: Date;
}

export class CreateBackorderCommandHandler
  implements ICommandHandler<CreateBackorderCommand, CommandResult<Backorder>>
{
  constructor(private readonly backorderService: BackorderManagementService) {}

  async handle(
    command: CreateBackorderCommand
  ): Promise<CommandResult<Backorder>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!command.orderItemId || command.orderItemId.trim().length === 0) {
        errors.push('orderItemId: Order item ID is required');
      }

      if (errors.length > 0) {
        return CommandResult.failure<Backorder>('Validation failed', errors);
      }

      // Execute service
      const backorder = await this.backorderService.createBackorder({
        orderItemId: command.orderItemId,
        promisedEta: command.promisedEta,
      });

      return CommandResult.success(backorder);
    } catch (error) {
      return CommandResult.failure<Backorder>(
        error instanceof Error ? error.message : 'Unknown error occurred',
        [error instanceof Error ? error.message : 'Unknown error']
      );
    }
  }
}

// Alias for backwards compatibility
export { CreateBackorderCommandHandler as CreateBackorderHandler };
