import { IReservationRepository } from "../../domain/repositories/ireservation.repository";
import { ICartRepository } from "../../domain/repositories/icart.repository";
import { Reservation, CreateReservationData } from "../../domain/entities/reservation.entity";
import { CartId } from "../../domain/value-objects/cart-id.vo";
import { VariantId } from "../../domain/value-objects/variant-id.vo";
import { Quantity } from "../../domain/value-objects/quantity.vo";

// DTOs for reservation operations
export interface CreateReservationDto {
  cartId: string;
  variantId: string;
  quantity: number;
  durationMinutes?: number;
}

export interface ExtendReservationDto {
  reservationId: string;
  additionalMinutes: number;
}

export interface RenewReservationDto {
  reservationId: string;
  durationMinutes?: number;
}

export interface AdjustReservationDto {
  cartId: string;
  variantId: string;
  newQuantity: number;
}

export interface ReservationDto {
  reservationId: string;
  cartId: string;
  variantId: string;
  quantity: number;
  expiresAt: Date;
  status: 'active' | 'expiring_soon' | 'expired' | 'recently_expired';
  isExpired: boolean;
  isExpiringSoon: boolean;
  timeUntilExpirySeconds: number;
  timeUntilExpiryMinutes: number;
  canBeExtended: boolean;
}

export interface AvailabilityDto {
  available: boolean;
  totalReserved: number;
  activeReserved: number;
  availableForReservation: number;
}

export interface ReservationConflictResolutionDto {
  resolved: number;
  conflicts: number;
  actions: Array<{
    action: 'extended' | 'reduced' | 'cancelled';
    reservationId: string;
    details: string;
  }>;
}

export interface ReservationStatisticsDto {
  totalReservations: number;
  activeReservations: number;
  expiredReservations: number;
  expiringSoonReservations: number;
  averageDurationMinutes: number;
  totalQuantityReserved: number;
  mostReservedVariants: Array<{
    variantId: string;
    totalQuantity: number;
    reservationCount: number;
  }>;
}

export interface BulkReservationDto {
  cartId: string;
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  durationMinutes?: number;
}

export interface BulkReservationResultDto {
  successful: ReservationDto[];
  failed: Array<{
    variantId: string;
    error: string;
  }>;
  totalCreated: number;
  totalFailed: number;
}

export class ReservationService {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly cartRepository: ICartRepository
  ) {}

  // Core reservation operations
  async createReservation(dto: CreateReservationDto): Promise<ReservationDto> {
    // Validate cart exists
    const cart = await this.cartRepository.findById(CartId.fromString(dto.cartId));
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Check if reservation already exists for this cart-variant combination
    const existingReservation = await this.reservationRepository.findByCartAndVariant(
      CartId.fromString(dto.cartId),
      VariantId.fromString(dto.variantId)
    );

    if (existingReservation) {
      // Update existing reservation quantity
      const newQuantity = existingReservation.getQuantity().getValue() + dto.quantity;
      existingReservation.updateQuantity(newQuantity);
      await this.reservationRepository.update(existingReservation);
      return this.mapReservationToDto(existingReservation);
    }

    // Create new reservation
    const reservation = await this.reservationRepository.createReservation(
      CartId.fromString(dto.cartId),
      VariantId.fromString(dto.variantId),
      Quantity.fromNumber(dto.quantity),
      dto.durationMinutes
    );

    return this.mapReservationToDto(reservation);
  }

  async getReservation(reservationId: string): Promise<ReservationDto | null> {
    const reservation = await this.reservationRepository.findById(reservationId);
    return reservation ? this.mapReservationToDto(reservation) : null;
  }

  async getCartReservations(cartId: string): Promise<ReservationDto[]> {
    const reservations = await this.reservationRepository.findByCartId(
      CartId.fromString(cartId)
    );
    return reservations.map(r => this.mapReservationToDto(r));
  }

  async getActiveCartReservations(cartId: string): Promise<ReservationDto[]> {
    const reservations = await this.reservationRepository.findActiveByCartId(
      CartId.fromString(cartId)
    );
    return reservations.map(r => this.mapReservationToDto(r));
  }

  async getVariantReservations(variantId: string): Promise<ReservationDto[]> {
    const reservations = await this.reservationRepository.findByVariantId(
      VariantId.fromString(variantId)
    );
    return reservations.map(r => this.mapReservationToDto(r));
  }

  // Reservation management
  async extendReservation(dto: ExtendReservationDto): Promise<ReservationDto> {
    const reservation = await this.reservationRepository.findById(dto.reservationId);
    if (!reservation) {
      throw new Error("Reservation not found");
    }

    if (!reservation.canBeExtended()) {
      throw new Error("Reservation cannot be extended");
    }

    const success = await this.reservationRepository.extendReservation(
      dto.reservationId,
      dto.additionalMinutes
    );

    if (!success) {
      throw new Error("Failed to extend reservation");
    }

    const updatedReservation = await this.reservationRepository.findById(dto.reservationId);
    return this.mapReservationToDto(updatedReservation!);
  }

  async renewReservation(dto: RenewReservationDto): Promise<ReservationDto> {
    const reservation = await this.reservationRepository.findById(dto.reservationId);
    if (!reservation) {
      throw new Error("Reservation not found");
    }

    const success = await this.reservationRepository.renewReservation(
      dto.reservationId,
      dto.durationMinutes
    );

    if (!success) {
      throw new Error("Failed to renew reservation");
    }

    const updatedReservation = await this.reservationRepository.findById(dto.reservationId);
    return this.mapReservationToDto(updatedReservation!);
  }

  async releaseReservation(reservationId: string): Promise<boolean> {
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      return false;
    }

    return await this.reservationRepository.releaseReservation(reservationId);
  }

  async adjustReservation(dto: AdjustReservationDto): Promise<ReservationDto | null> {
    const reservation = await this.reservationRepository.adjustReservation(
      CartId.fromString(dto.cartId),
      VariantId.fromString(dto.variantId),
      dto.newQuantity
    );

    return reservation ? this.mapReservationToDto(reservation) : null;
  }

  // Inventory management
  async checkAvailability(variantId: string, requestedQuantity: number): Promise<AvailabilityDto> {
    return await this.reservationRepository.checkAvailability(
      VariantId.fromString(variantId),
      requestedQuantity
    );
  }

  async reserveInventory(
    cartId: string,
    variantId: string,
    quantity: number,
    durationMinutes?: number
  ): Promise<ReservationDto> {
    const reservation = await this.reservationRepository.reserveInventory(
      CartId.fromString(cartId),
      VariantId.fromString(variantId),
      quantity,
      durationMinutes
    );

    return this.mapReservationToDto(reservation);
  }

  async getTotalReservedQuantity(variantId: string): Promise<number> {
    return await this.reservationRepository.getTotalReservedQuantity(
      VariantId.fromString(variantId)
    );
  }

  async getActiveReservedQuantity(variantId: string): Promise<number> {
    return await this.reservationRepository.getActiveReservedQuantity(
      VariantId.fromString(variantId)
    );
  }

  // Bulk operations
  async createBulkReservations(dto: BulkReservationDto): Promise<BulkReservationResultDto> {
    const successful: ReservationDto[] = [];
    const failed: Array<{ variantId: string; error: string }> = [];

    for (const item of dto.items) {
      try {
        const reservation = await this.createReservation({
          cartId: dto.cartId,
          variantId: item.variantId,
          quantity: item.quantity,
          durationMinutes: dto.durationMinutes,
        });
        successful.push(reservation);
      } catch (error) {
        failed.push({
          variantId: item.variantId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      successful,
      failed,
      totalCreated: successful.length,
      totalFailed: failed.length,
    };
  }

  // Expiration management
  async getExpiredReservations(): Promise<ReservationDto[]> {
    const reservations = await this.reservationRepository.findExpiredReservations();
    return reservations.map(r => this.mapReservationToDto(r));
  }

  async getExpiringSoonReservations(thresholdMinutes: number = 5): Promise<ReservationDto[]> {
    const reservations = await this.reservationRepository.findExpiringSoon(thresholdMinutes);
    return reservations.map(r => this.mapReservationToDto(r));
  }

  async cleanupExpiredReservations(): Promise<number> {
    return await this.reservationRepository.cleanupExpiredReservations();
  }

  async getReservationsExpiringBetween(startTime: Date, endTime: Date): Promise<ReservationDto[]> {
    const reservations = await this.reservationRepository.findReservationsExpiringBetween(
      startTime,
      endTime
    );
    return reservations.map(r => this.mapReservationToDto(r));
  }

  // Advanced operations
  async resolveReservationConflicts(variantId: string): Promise<ReservationConflictResolutionDto> {
    return await this.reservationRepository.resolveReservationConflicts(
      VariantId.fromString(variantId)
    );
  }

  async findConflictingReservations(
    variantId: string,
    quantity: number,
    excludeCartId?: string
  ): Promise<ReservationDto[]> {
    const reservations = await this.reservationRepository.findConflictingReservations(
      VariantId.fromString(variantId),
      quantity,
      excludeCartId ? CartId.fromString(excludeCartId) : undefined
    );
    return reservations.map(r => this.mapReservationToDto(r));
  }

  // Analytics and reporting
  async getReservationStatistics(): Promise<ReservationStatisticsDto> {
    return await this.reservationRepository.getReservationStatistics();
  }

  async getReservationsByTimeframe(
    timeframe: 'hour' | 'day' | 'week' | 'month',
    count?: number
  ): Promise<Array<{
    period: string;
    reservationCount: number;
    totalQuantity: number;
    uniqueVariants: number;
    uniqueCarts: number;
  }>> {
    return await this.reservationRepository.getReservationsByTimeframe(timeframe, count);
  }

  async getReservationsByStatus(
    status: 'active' | 'expiring_soon' | 'expired' | 'recently_expired'
  ): Promise<ReservationDto[]> {
    const reservations = await this.reservationRepository.findByStatus(status);
    return reservations.map(r => this.mapReservationToDto(r));
  }

  // Validation operations
  async validateReservationCapacity(variantId: string, requestedQuantity: number): Promise<boolean> {
    return await this.reservationRepository.validateReservationCapacity(
      VariantId.fromString(variantId),
      requestedQuantity
    );
  }

  async isReservationExtendable(reservationId: string): Promise<boolean> {
    return await this.reservationRepository.isReservationExtendable(reservationId);
  }

  async canCreateReservation(cartId: string, variantId: string, quantity: number): Promise<boolean> {
    return await this.reservationRepository.canCreateReservation(
      CartId.fromString(cartId),
      VariantId.fromString(variantId),
      quantity
    );
  }

  // Maintenance operations
  async optimizeReservations(): Promise<number> {
    return await this.reservationRepository.optimizeReservations();
  }

  async consolidateExpiredReservations(): Promise<number> {
    return await this.reservationRepository.consolidateExpiredReservations();
  }

  async archiveOldReservations(olderThanDays: number): Promise<number> {
    return await this.reservationRepository.archiveOldReservations(olderThanDays);
  }

  // Background job support
  async getReservationsForCleanup(batchSize: number = 100): Promise<ReservationDto[]> {
    const reservations = await this.reservationRepository.getReservationsForCleanup(batchSize);
    return reservations.map(r => this.mapReservationToDto(r));
  }

  async getReservationsForExtension(
    thresholdMinutes: number,
    batchSize: number = 100
  ): Promise<ReservationDto[]> {
    const reservations = await this.reservationRepository.getReservationsForExtension(
      thresholdMinutes,
      batchSize
    );
    return reservations.map(r => this.mapReservationToDto(r));
  }

  async getReservationsForNotification(
    thresholdMinutes: number,
    batchSize: number = 100
  ): Promise<ReservationDto[]> {
    const reservations = await this.reservationRepository.getReservationsForNotification(
      thresholdMinutes,
      batchSize
    );
    return reservations.map(r => this.mapReservationToDto(r));
  }

  // Utility methods
  private mapReservationToDto(reservation: Reservation): ReservationDto {
    const summary = reservation.getSummary();
    return {
      reservationId: summary.reservationId,
      cartId: summary.cartId,
      variantId: summary.variantId,
      quantity: summary.quantity,
      expiresAt: summary.expiresAt,
      status: summary.status,
      isExpired: summary.isExpired,
      isExpiringSoon: summary.isExpiringSoon,
      timeUntilExpirySeconds: summary.timeUntilExpirySeconds,
      timeUntilExpiryMinutes: summary.timeUntilExpiryMinutes,
      canBeExtended: summary.canBeExtended,
    };
  }

  // Batch processing helpers
  async processExpiredReservations(): Promise<{
    cleaned: number;
    consolidated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let cleaned = 0;
    let consolidated = 0;

    try {
      cleaned = await this.cleanupExpiredReservations();
    } catch (error) {
      errors.push(`Cleanup failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    try {
      consolidated = await this.consolidateExpiredReservations();
    } catch (error) {
      errors.push(`Consolidation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    return { cleaned, consolidated, errors };
  }

  async extendExpiringSoonReservations(
    thresholdMinutes: number = 5,
    extensionMinutes: number = 30
  ): Promise<{
    extended: number;
    failed: number;
    errors: string[];
  }> {
    const expiringSoon = await this.getExpiringSoonReservations(thresholdMinutes);
    const errors: string[] = [];
    let extended = 0;
    let failed = 0;

    for (const reservation of expiringSoon) {
      try {
        await this.extendReservation({
          reservationId: reservation.reservationId,
          additionalMinutes: extensionMinutes,
        });
        extended++;
      } catch (error) {
        failed++;
        errors.push(
          `Failed to extend reservation ${reservation.reservationId}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    return { extended, failed, errors };
  }
}