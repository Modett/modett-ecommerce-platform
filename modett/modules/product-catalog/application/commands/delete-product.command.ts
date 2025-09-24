import { ProductManagementService } from '../services/product-management.service';

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

export interface DeleteProductCommand extends ICommand {
  productId: string;
}

export class DeleteProductHandler implements ICommandHandler<DeleteProductCommand, CommandResult<boolean>> {
  constructor(
    private readonly productManagementService: ProductManagementService
  ) {}

  async handle(command: DeleteProductCommand): Promise<CommandResult<boolean>> {
    try {
      // Validate command
      if (!command.productId) {
        return CommandResult.failure<boolean>(
          'Product ID is required',
          ['productId']
        );
      }

      await this.productManagementService.deleteProduct(command.productId);
      return CommandResult.success<boolean>(true);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<boolean>(
          'Product deletion failed',
          [error.message]
        );
      }

      return CommandResult.failure<boolean>(
        'An unexpected error occurred during product deletion'
      );
    }
  }
}