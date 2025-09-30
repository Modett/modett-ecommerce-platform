import { ReservationService, ReservationDto } from "../services/reservation.service";
import { CommandResult } from "../commands/add-to-cart.command";
import { IQuery, IQueryHandler } from "./get-cart.query";

export interface GetReservationsQuery extends IQuery {
  cartId: string;
}

export class GetReservationsHandler implements IQueryHandler<GetReservationsQuery, CommandResult<ReservationDto[]>> {
  constructor(private readonly reservationService: ReservationService) {}

  async handle(query: GetReservationsQuery): Promise<CommandResult<ReservationDto[]>> {
    try {
      if (!query.cartId) {
        return CommandResult.failure<ReservationDto[]>(
          'Cart ID is required',
          ['cartId']
        );
      }

      const reservations = await this.reservationService.getActiveCartReservations(query.cartId);

      return CommandResult.success<ReservationDto[]>(reservations);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<ReservationDto[]>(
          'Failed to retrieve reservations',
          [error.message]
        );
      }

      return CommandResult.failure<ReservationDto[]>(
        'An unexpected error occurred while retrieving reservations'
      );
    }
  }
}

export interface GetReservationByVariantQuery extends IQuery {
  cartId: string;
  variantId: string;
}

export class GetReservationByVariantHandler implements IQueryHandler<GetReservationByVariantQuery, CommandResult<ReservationDto | null>> {
  constructor(private readonly reservationService: ReservationService) {}

  async handle(query: GetReservationByVariantQuery): Promise<CommandResult<ReservationDto | null>> {
    try {
      if (!query.cartId) {
        return CommandResult.failure<ReservationDto | null>(
          'Cart ID is required',
          ['cartId']
        );
      }

      if (!query.variantId) {
        return CommandResult.failure<ReservationDto | null>(
          'Variant ID is required',
          ['variantId']
        );
      }

      const reservations = await this.reservationService.getCartReservations(query.cartId);
      const reservation = reservations.find(r => r.variantId === query.variantId);

      return CommandResult.success<ReservationDto | null>(reservation || null);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<ReservationDto | null>(
          'Failed to retrieve reservation',
          [error.message]
        );
      }

      return CommandResult.failure<ReservationDto | null>(
        'An unexpected error occurred while retrieving reservation'
      );
    }
  }
}