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

export interface GetShipmentQuery extends IQuery {
  orderId: string;
  shipmentId: string;
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

export class GetShipmentHandler
  implements IQueryHandler<GetShipmentQuery, CommandResult<ShipmentResult>>
{
  constructor(private readonly orderManagementService: OrderManagementService) {}

  async handle(query: GetShipmentQuery): Promise<CommandResult<ShipmentResult>> {
    try {
      // Validate
      if (!query.orderId || query.orderId.trim().length === 0) {
        return CommandResult.failure<ShipmentResult>(
          'orderId is required',
          ['orderId']
        );
      }

      if (!query.shipmentId || query.shipmentId.trim().length === 0) {
        return CommandResult.failure<ShipmentResult>(
          'shipmentId is required',
          ['shipmentId']
        );
      }

      // Get shipment
      const shipment = await this.orderManagementService.getShipment(
        query.orderId,
        query.shipmentId
      );

      if (!shipment) {
        return CommandResult.failure<ShipmentResult>('Shipment not found');
      }

      const result: ShipmentResult = {
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
      };

      return CommandResult.success<ShipmentResult>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<ShipmentResult>(
          'Failed to retrieve shipment',
          [error.message]
        );
      }

      return CommandResult.failure<ShipmentResult>(
        'An unexpected error occurred while retrieving shipment'
      );
    }
  }
}
