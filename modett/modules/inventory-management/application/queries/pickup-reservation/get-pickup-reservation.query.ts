import { IQuery, IQueryHandler } from "../stock/get-stock.query";
import { CommandResult } from "../../commands/stock/add-stock.command";
import { PickupReservationService } from "../../services/pickup-reservation.service";

export interface GetPickupReservationQuery extends IQuery {
  reservationId: string;
}

export interface PickupReservationResult {
  reservationId: string;
  orderId: string;
  variantId: string;
  locationId: string;
  qty: number;
  expiresAt: Date;
  isExpired: boolean;
}

export class GetPickupReservationQueryHandler
  implements IQueryHandler<GetPickupReservationQuery, CommandResult<PickupReservationResult | null>>
{
  constructor(private readonly reservationService: PickupReservationService) {}

  async handle(
    query: GetPickupReservationQuery
  ): Promise<CommandResult<PickupReservationResult | null>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!query.reservationId || query.reservationId.trim().length === 0) {
        errors.push("reservationId: Reservation ID is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<PickupReservationResult | null>(
          "Validation failed",
          errors
        );
      }

      const reservation = await this.reservationService.getPickupReservation(
        query.reservationId
      );

      if (!reservation) {
        return CommandResult.success<PickupReservationResult | null>(null);
      }

      const result: PickupReservationResult = {
        reservationId: reservation.getReservationId().getValue(),
        orderId: reservation.getOrderId(),
        variantId: reservation.getVariantId(),
        locationId: reservation.getLocationId(),
        qty: reservation.getQty(),
        expiresAt: reservation.getExpiresAt(),
        isExpired: reservation.isExpired(),
      };

      return CommandResult.success(result);
    } catch (error) {
      return CommandResult.failure<PickupReservationResult | null>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

export { GetPickupReservationQueryHandler as GetPickupReservationHandler };
