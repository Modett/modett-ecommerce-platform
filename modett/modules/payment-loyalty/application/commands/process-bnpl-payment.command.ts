import {
  BnplTransactionService,
  BnplTransactionDto,
} from "../services/bnpl-transaction.service.js";
import {
  ICommand,
  ICommandHandler,
  CommandResult,
} from "./create-payment-intent.command.js";

type BnplAction = "approve" | "reject" | "activate" | "complete" | "cancel";

export interface ProcessBnplPaymentCommand extends ICommand {
  bnplId: string;
  action: BnplAction;
  userId?: string;
}

export class ProcessBnplPaymentHandler
  implements
    ICommandHandler<
      ProcessBnplPaymentCommand,
      CommandResult<BnplTransactionDto>
    >
{
  constructor(private readonly bnplService: BnplTransactionService) {}

  async handle(
    command: ProcessBnplPaymentCommand
  ): Promise<CommandResult<BnplTransactionDto>> {
    try {
      // Validate command
      const errors: string[] = [];
      if (!command.bnplId) errors.push("bnplId");
      if (!command.action) errors.push("action");
      const allowed: BnplAction[] = [
        "approve",
        "reject",
        "activate",
        "complete",
        "cancel",
      ];
      if (command.action && !allowed.includes(command.action)) {
        errors.push("action");
      }
      if (errors.length > 0) {
        return CommandResult.failure<BnplTransactionDto>(
          "Validation failed",
          errors
        );
      }

      let result: BnplTransactionDto;
      switch (command.action) {
        case "approve":
          result = await this.bnplService.approveBnplTransaction(
            command.bnplId,
            command.userId
          );
          break;
        case "reject":
          result = await this.bnplService.rejectBnplTransaction(
            command.bnplId,
            command.userId
          );
          break;
        case "activate":
          result = await this.bnplService.activateBnplTransaction(
            command.bnplId,
            command.userId
          );
          break;
        case "complete":
          result = await this.bnplService.completeBnplTransaction(
            command.bnplId,
            command.userId
          );
          break;
        case "cancel":
          result = await this.bnplService.cancelBnplTransaction(
            command.bnplId,
            command.userId
          );
          break;
        default:
          return CommandResult.failure<BnplTransactionDto>(
            "Unsupported action",
            ["action"]
          );
      }

      return CommandResult.success<BnplTransactionDto>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<BnplTransactionDto>(
          "Failed to process BNPL payment",
          [error.message]
        );
      }
      return CommandResult.failure<BnplTransactionDto>(
        "An unexpected error occurred while processing BNPL payment"
      );
    }
  }
}
