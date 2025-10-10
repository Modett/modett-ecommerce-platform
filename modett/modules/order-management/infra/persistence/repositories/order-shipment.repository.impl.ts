import { PrismaClient } from '@prisma/client';
import {
  IOrderShipmentRepository,
  ShipmentQueryOptions,
} from '../../../domain/repositories/order-shipment.repository';
import { OrderShipment } from '../../../domain/entities/order-shipment.entity';

interface OrderShipmentDatabaseRow {
  id: string;
  orderId: string;
  carrier: string | null;
  service: string | null;
  trackingNo: string | null;
  giftReceipt: boolean;
  pickupLocationId: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
}

export class OrderShipmentRepositoryImpl implements IOrderShipmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Hydration: Database row � Entity
  private toEntity(row: OrderShipmentDatabaseRow): OrderShipment {
    return OrderShipment.reconstitute({
      shipmentId: row.id,
      orderId: row.orderId,
      carrier: row.carrier || undefined,
      service: row.service || undefined,
      trackingNumber: row.trackingNo || undefined,
      giftReceipt: row.giftReceipt,
      pickupLocationId: row.pickupLocationId || undefined,
      shippedAt: row.shippedAt || undefined,
      deliveredAt: row.deliveredAt || undefined,
    });
  }

  async save(shipment: OrderShipment): Promise<void> {
    await this.prisma.orderShipment.create({
      data: {
        id: shipment.getShipmentId(),
        orderId: shipment.getOrderId(),
        carrier: shipment.getCarrier() || null,
        service: shipment.getService() || null,
        trackingNo: shipment.getTrackingNumber() || null,
        giftReceipt: shipment.hasGiftReceipt(),
        pickupLocationId: shipment.getPickupLocationId() || null,
        shippedAt: shipment.getShippedAt() || null,
        deliveredAt: shipment.getDeliveredAt() || null,
      },
    });
  }

  async update(shipment: OrderShipment): Promise<void> {
    await this.prisma.orderShipment.update({
      where: { id: shipment.getShipmentId() },
      data: {
        carrier: shipment.getCarrier() || null,
        service: shipment.getService() || null,
        trackingNo: shipment.getTrackingNumber() || null,
        giftReceipt: shipment.hasGiftReceipt(),
        pickupLocationId: shipment.getPickupLocationId() || null,
        shippedAt: shipment.getShippedAt() || null,
        deliveredAt: shipment.getDeliveredAt() || null,
      },
    });
  }

  async delete(shipmentId: string): Promise<void> {
    await this.prisma.orderShipment.delete({
      where: { id: shipmentId },
    });
  }

  async deleteByOrderId(orderId: string): Promise<void> {
    await this.prisma.orderShipment.deleteMany({
      where: { orderId },
    });
  }

  async findById(shipmentId: string): Promise<OrderShipment | null> {
    const shipment = await this.prisma.orderShipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      return null;
    }

    return this.toEntity(shipment as any);
  }

  async findByOrderId(
    orderId: string,
    options?: ShipmentQueryOptions
  ): Promise<OrderShipment[]> {
    const {
      limit,
      offset,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const shipments = await this.prisma.orderShipment.findMany({
      where: { orderId },
      take: limit,
      skip: offset,
      orderBy:
        sortBy === 'shippedAt'
          ? { shippedAt: sortOrder }
          : sortBy === 'deliveredAt'
          ? { deliveredAt: sortOrder }
          : undefined,
    });

    return shipments.map((shipment) => this.toEntity(shipment as any));
  }

  async findByTrackingNumber(
    trackingNumber: string
  ): Promise<OrderShipment | null> {
    const shipment = await this.prisma.orderShipment.findFirst({
      where: { trackingNo: trackingNumber },
    });

    if (!shipment) {
      return null;
    }

    return this.toEntity(shipment as any);
  }

  async findByCarrier(
    carrier: string,
    options?: ShipmentQueryOptions
  ): Promise<OrderShipment[]> {
    const {
      limit,
      offset,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const shipments = await this.prisma.orderShipment.findMany({
      where: { carrier },
      take: limit,
      skip: offset,
      orderBy:
        sortBy === 'shippedAt'
          ? { shippedAt: sortOrder }
          : sortBy === 'deliveredAt'
          ? { deliveredAt: sortOrder }
          : undefined,
    });

    return shipments.map((shipment) => this.toEntity(shipment as any));
  }

  async findShipped(options?: ShipmentQueryOptions): Promise<OrderShipment[]> {
    const {
      limit,
      offset,
      sortBy = 'shippedAt',
      sortOrder = 'desc',
    } = options || {};

    const shipments = await this.prisma.orderShipment.findMany({
      where: {
        shippedAt: { not: null },
      },
      take: limit,
      skip: offset,
      orderBy:
        sortBy === 'shippedAt'
          ? { shippedAt: sortOrder }
          : sortBy === 'deliveredAt'
          ? { deliveredAt: sortOrder }
          : undefined,
    });

    return shipments.map((shipment) => this.toEntity(shipment as any));
  }

  async findDelivered(
    options?: ShipmentQueryOptions
  ): Promise<OrderShipment[]> {
    const {
      limit,
      offset,
      sortBy = 'deliveredAt',
      sortOrder = 'desc',
    } = options || {};

    const shipments = await this.prisma.orderShipment.findMany({
      where: {
        deliveredAt: { not: null },
      },
      take: limit,
      skip: offset,
      orderBy:
        sortBy === 'shippedAt'
          ? { shippedAt: sortOrder }
          : sortBy === 'deliveredAt'
          ? { deliveredAt: sortOrder }
          : undefined,
    });

    return shipments.map((shipment) => this.toEntity(shipment as any));
  }

  async findPending(options?: ShipmentQueryOptions): Promise<OrderShipment[]> {
    const {
      limit,
      offset,
      sortOrder = 'desc',
    } = options || {};

    const shipments = await this.prisma.orderShipment.findMany({
      where: {
        shippedAt: null,
      },
      take: limit,
      skip: offset,
    });

    return shipments.map((shipment) => this.toEntity(shipment as any));
  }

  async countByOrderId(orderId: string): Promise<number> {
    return await this.prisma.orderShipment.count({
      where: { orderId },
    });
  }

  async countByCarrier(carrier: string): Promise<number> {
    return await this.prisma.orderShipment.count({
      where: { carrier },
    });
  }

  async countShipped(): Promise<number> {
    return await this.prisma.orderShipment.count({
      where: {
        shippedAt: { not: null },
      },
    });
  }

  async countDelivered(): Promise<number> {
    return await this.prisma.orderShipment.count({
      where: {
        deliveredAt: { not: null },
      },
    });
  }

  async exists(shipmentId: string): Promise<boolean> {
    const count = await this.prisma.orderShipment.count({
      where: { id: shipmentId },
    });

    return count > 0;
  }

  async existsByTrackingNumber(trackingNumber: string): Promise<boolean> {
    const count = await this.prisma.orderShipment.count({
      where: { trackingNo: trackingNumber },
    });

    return count > 0;
  }
}
