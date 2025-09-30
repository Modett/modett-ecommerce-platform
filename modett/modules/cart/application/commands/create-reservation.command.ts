import { ReservationService, ReservationDto } from "../services/reservation.service";
import { ICommand, ICommandHandler, CommandResult } from "./add-to-cart.command";

export interface CreateReservationCommand extends ICommand {
  cartId: string;
  variantId: string;
  quantity: number;
  durationMinutes?: number;
}

export class CreateReservationHandler implements ICommandHandler<CreateReservationCommand, CommandResult<ReservationDto>> {
  constructor(private readonly reservationService: ReservationService) {}

  async handle(command: CreateReservationCommand): Promise<CommandResult<ReservationDto>> {
    try {
      // Validate command
      if (!command.cartId) {
        return CommandResult.failure<ReservationDto>(
          'Cart ID is required',
          ['cartId']
        );
      }

      if (!command.variantId) {
        return CommandResult.failure<ReservationDto>(
          'Variant ID is required',
          ['variantId']
        );
      }

      if (!command.quantity || command.quantity <= 0) {
        return CommandResult.failure<ReservationDto>(
          'Quantity must be greater than 0',
          ['quantity']
        );
      }

      const reservation = await this.reservationService.createReservation({
        cartId: command.cartId,
        variantId: command.variantId,
        quantity: command.quantity,
        durationMinutes: command.durationMinutes,
      });

      return CommandResult.success<ReservationDto>(reservation);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<ReservationDto>(
          'Failed to create reservation',
          [error.message]
        );
      }

      return CommandResult.failure<ReservationDto>(
        'An unexpected error occurred while creating reservation'
      );
    }
  }
}