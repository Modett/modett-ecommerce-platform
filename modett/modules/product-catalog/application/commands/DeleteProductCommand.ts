import { ICommand } from './Command';

export class DeleteProductCommand implements ICommand {
  readonly commandId?: string;
  readonly timestamp?: Date;

  constructor(
    public readonly productId: string,
    commandId?: string
  ) {
    this.commandId = commandId;
    this.timestamp = new Date();
  }
}