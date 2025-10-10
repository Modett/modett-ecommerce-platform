import { OrderManagementService } from '../services/order-management.service';
import { OrderShipment } from '../../domain/entities/order-shipment.entity';
import { CommandResult } from '../commands/create-order.command';

export interface IQuery {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery, TResult = any> {
  handle(query: TQuery): Promise<TResult>;
}

export interface GetOrderShipmentsQuery extends IQuery {
  orderId: string;
}

export interface ShipmentResult {
  shipmentId: string;
  orderId: string;
  carrier?: string;
  service?: string;
  trackingNumber?: string;
  giftReceipt: boolean;
  pickupLocationId?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  isShipped: boolean;
  isDelivered: boolean;
}

export class GetOrderShipmentsHandler
  implements IQueryHandler<GetOrderShipmentsQuery, CommandResult<ShipmentResult[]>>
{
  constructor(private readonly orderManagementService: OrderManagementService) {}

  async handle(
    query: GetOrderShipmentsQuery
  ): Promise<CommandResult<ShipmentResult[]>> {
    try {
      // Validate
      if (!query.orderId || query.orderId.trim().length === 0) {
        return CommandResult.failure<ShipmentResult[]>(
          'orderId is required',
          ['orderId']
        );
      }

      // Get shipments
      const shipments = await this.orderManagementService.getOrderShipments(
        query.orderId
      );

      const results: ShipmentResult[] = shipments.map((shipment) => ({
        shipmentId: shipment.getShipmentId(),
        orderId: shipment.getOrderId(),
        carrier: shipment.getCarrier(),
        service: shipment.getService(),
        trackingNumber: shipment.getTrackingNumber(),
        giftReceipt: shipment.hasGiftReceipt(),
        pickupLocationId: shipment.getPickupLocationId(),
        shippedAt: shipment.getShippedAt(),
        deliveredAt: shipment.getDeliveredAt(),
        isShipped: shipment.isShipped(),
        isDelivered: shipment.isDelivered(),
      }));

      return CommandResult.success<ShipmentResult[]>(results);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<ShipmentResult[]>(
          'Failed to retrieve shipments',
          [error.message]
        );
      }

      return CommandResult.failure<ShipmentResult[]>(
        'An unexpected error occurred while retrieving shipments'
      );
    }
  }
}
