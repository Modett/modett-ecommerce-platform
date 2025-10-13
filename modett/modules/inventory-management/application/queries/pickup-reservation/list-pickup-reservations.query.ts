import { IQuery, IQueryHandler } from "../stock/get-stock.query";
import { CommandResult } from "../../commands/stock/add-stock.command";
import { PickupReservationService } from "../../services/pickup-reservation.service";
import { PickupReservationResult } from "./get-pickup-reservation.query";

export interface ListPickupReservationsQuery extends IQuery {
  orderId?: string;
  locationId?: string;
  activeOnly?: boolean;
}

export class ListPickupReservationsQueryHandler
  implements IQueryHandler<ListPickupReservationsQuery, CommandResult<PickupReservationResult[]>>
{
  constructor(private readonly reservationService: PickupReservationService) {}

  async handle(
    query: ListPickupReservationsQuery
  ): Promise<CommandResult<PickupReservationResult[]>> {
    try {
      let reservations;

      if (query.activeOnly) {
        reservations = await this.reservationService.getActiveReservations();
      } else if (query.orderId) {
        reservations = await this.reservationService.getReservationsByOrder(
          query.orderId
        );
      } else if (query.locationId) {
        reservations = await this.reservationService.getReservationsByLocation(
          query.locationId
        );
      } else {
        reservations = await this.reservationService.getActiveReservations();
      }

      const results: PickupReservationResult[] = reservations.map((reservation) => ({
        reservationId: reservation.getReservationId().getValue(),
        orderId: reservation.getOrderId(),
        variantId: reservation.getVariantId(),
        locationId: reservation.getLocationId(),
        qty: reservation.getQty(),
        expiresAt: reservation.getExpiresAt(),
        isExpired: reservation.isExpired(),
      }));

      return CommandResult.success(results);
    } catch (error) {
      return CommandResult.failure<PickupReservationResult[]>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

export { ListPickupReservationsQueryHandler as ListPickupReservationsHandler };
