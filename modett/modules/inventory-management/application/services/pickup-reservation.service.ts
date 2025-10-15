import { v4 as uuidv4 } from "uuid";
import { PickupReservation } from "../../domain/entities/pickup-reservation.entity";
import { ReservationId } from "../../domain/value-objects/reservation-id.vo";
import { IPickupReservationRepository } from "../../domain/repositories/pickup-reservation.repository";
import { StockManagementService } from "./stock-management.service";

export class PickupReservationService {
  async getAllReservations(): Promise<PickupReservation[]> {
    // You should implement this in your repository for efficiency; here we combine byOrder/byLocation as fallback
    // If your repository has a findAll method, use it instead
    if (
      typeof (this.pickupReservationRepository as any).findAll === "function"
    ) {
      return (this.pickupReservationRepository as any).findAll();
    }
    // Fallback: get all active + all expired
    const active =
      await this.pickupReservationRepository.findActiveReservations();
    const expired =
      await this.pickupReservationRepository.findExpiredReservations();
    return [...active, ...expired];
  }
  constructor(
    private readonly pickupReservationRepository: IPickupReservationRepository,
    private readonly stockManagementService: StockManagementService
  ) {}

  async createPickupReservation(
    orderId: string,
    variantId: string,
    locationId: string,
    qty: number,
    expirationMinutes: number = 30
  ): Promise<PickupReservation> {
    if (qty <= 0) {
      throw new Error("Reservation quantity must be greater than zero");
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    // Reserve stock in inventory
    await this.stockManagementService.reserveStock(variantId, locationId, qty);

    // Create reservation
    const reservation = PickupReservation.create({
      reservationId: ReservationId.create(uuidv4()),
      orderId,
      variantId,
      locationId,
      qty,
      expiresAt,
    });

    await this.pickupReservationRepository.save(reservation);
    return reservation;
  }

  async cancelPickupReservation(
    reservationId: string
  ): Promise<PickupReservation> {
    const reservation = await this.pickupReservationRepository.findById(
      ReservationId.create(reservationId)
    );

    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }

    if (!reservation.isActive()) {
      throw new Error("Can only cancel active reservations");
    }

    // Release stock reservation
    await this.stockManagementService.releaseReservation(
      reservation.getVariantId(),
      reservation.getLocationId(),
      reservation.getQty(),
      reservation.getOrderId()
    );

    // Mark reservation as cancelled (keep record for history)
    const cancelledReservation = reservation.cancel();
    await this.pickupReservationRepository.save(cancelledReservation);

    return cancelledReservation;
  }

  async extendReservation(
    reservationId: string,
    additionalMinutes: number
  ): Promise<PickupReservation> {
    const reservation = await this.pickupReservationRepository.findById(
      ReservationId.create(reservationId)
    );

    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }

    if (reservation.isExpired()) {
      throw new Error("Cannot extend an expired reservation");
    }

    const newExpiresAt = new Date(reservation.getExpiresAt());
    newExpiresAt.setMinutes(newExpiresAt.getMinutes() + additionalMinutes);

    const extendedReservation = reservation.extendExpiration(newExpiresAt);
    await this.pickupReservationRepository.save(extendedReservation);

    return extendedReservation;
  }

  async cleanupExpiredReservations(): Promise<number> {
    // Find active reservations that have expired by time
    const activeReservations =
      await this.pickupReservationRepository.findActiveReservations();
    const now = new Date();
    const timeExpiredReservations = activeReservations.filter(
      (r) => now > r.getExpiresAt()
    );

    let cleanedCount = 0;

    for (const reservation of timeExpiredReservations) {
      try {
        // Release stock reservation
        await this.stockManagementService.releaseReservation(
          reservation.getVariantId(),
          reservation.getLocationId(),
          reservation.getQty(),
          reservation.getOrderId()
        );

        // Mark reservation as expired (don't delete)
        const expiredReservation = reservation.markAsExpired();
        await this.pickupReservationRepository.save(expiredReservation);

        cleanedCount++;
      } catch (error) {
        // If stock release fails due to data inconsistency, try to fix it
        if (
          error instanceof Error &&
          error.message?.includes("Cannot release more than reserved quantity")
        ) {
          console.warn(
            `Data inconsistency detected for reservation ${reservation.getReservationId().getValue()}. Attempting graceful cleanup...`
          );

          try {
            // Get current stock to see actual reserved quantity
            const currentStock = await this.stockManagementService.getStock(
              reservation.getVariantId(),
              reservation.getLocationId()
            );

            if (
              currentStock &&
              currentStock.getStockLevel().getReserved() > 0
            ) {
              // Release only what's actually reserved
              await this.stockManagementService.releaseReservation(
                reservation.getVariantId(),
                reservation.getLocationId(),
                currentStock.getStockLevel().getReserved(),
                reservation.getOrderId()
              );
            }

            // Mark the problematic reservation as expired (keep record for history)
            const expiredReservation = reservation.markAsExpired();
            await this.pickupReservationRepository.save(expiredReservation);

            cleanedCount++;
            console.log(
              `Successfully cleaned up inconsistent reservation ${reservation.getReservationId().getValue()}`
            );
          } catch (secondError) {
            console.error(
              `Failed to cleanup inconsistent reservation ${reservation.getReservationId().getValue()}:`,
              secondError
            );
          }
        } else {
          console.error(
            `Failed to cleanup reservation ${reservation.getReservationId().getValue()}:`,
            error
          );
        }
      }
    }

    return cleanedCount;
  }

  async getPickupReservation(
    reservationId: string
  ): Promise<PickupReservation | null> {
    return this.pickupReservationRepository.findById(
      ReservationId.create(reservationId)
    );
  }

  async getReservationsByOrder(orderId: string): Promise<PickupReservation[]> {
    return this.pickupReservationRepository.findByOrder(orderId);
  }

  async getReservationsByLocation(
    locationId: string
  ): Promise<PickupReservation[]> {
    return this.pickupReservationRepository.findByLocation(locationId);
  }

  async getActiveReservations(): Promise<PickupReservation[]> {
    return this.pickupReservationRepository.findActiveReservations();
  }

  async fulfillPickupReservation(
    reservationId: string
  ): Promise<PickupReservation> {
    const reservation = await this.pickupReservationRepository.findById(
      ReservationId.create(reservationId)
    );

    if (!reservation) {
      throw new Error(`Reservation with ID ${reservationId} not found`);
    }

    if (!reservation.isActive()) {
      throw new Error("Can only fulfill active reservations");
    }

    // Fulfill stock reservation (removes from inventory)
    await this.stockManagementService.fulfillReservation(
      reservation.getVariantId(),
      reservation.getLocationId(),
      reservation.getQty()
    );

    // Mark reservation as fulfilled
    const fulfilledReservation = reservation.fulfill();
    await this.pickupReservationRepository.save(fulfilledReservation);

    return fulfilledReservation;
  }

  async getTotalReservedQty(
    variantId: string,
    locationId: string
  ): Promise<number> {
    return this.pickupReservationRepository.getTotalReservedQty(
      variantId,
      locationId
    );
  }
}
