import { FastifyRequest, FastifyReply } from "fastify";
import { OrderManagementService } from "../../../application/services/order-management.service";

interface AddressData {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

interface SetAddressesRequest {
  Params: { orderId: string };
  Body: {
    billingAddress: AddressData;
    shippingAddress: AddressData;
  };
}

interface UpdateBillingAddressRequest {
  Params: { orderId: string };
  Body: AddressData;
}

interface UpdateShippingAddressRequest {
  Params: { orderId: string };
  Body: AddressData;
}

interface GetAddressesRequest {
  Params: { orderId: string };
}

export class OrderAddressController {
  constructor(private readonly orderManagementService: OrderManagementService) {}

  async setAddresses(
    request: FastifyRequest<SetAddressesRequest>,
    reply: FastifyReply
  ) {
    try {
      const { orderId } = request.params;
      const { billingAddress, shippingAddress } = request.body;

      // Validate request
      if (!billingAddress || !shippingAddress) {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Both billing and shipping addresses are required",
        });
      }

      const orderAddress = await this.orderManagementService.setOrderAddress(
        orderId,
        billingAddress,
        shippingAddress
      );

      return reply.code(201).send({
        success: true,
        data: {
          orderId: orderAddress.getOrderId(),
          billingAddress: orderAddress.getBillingAddress().toJSON(),
          shippingAddress: orderAddress.getShippingAddress().toJSON(),
          isSameAddress: orderAddress.isSameAddress(),
        },
        message: "Order addresses set successfully",
      });
    } catch (error) {
      request.log.error(error, "Failed to set order addresses");

      if (error instanceof Error) {
        const errorMessage = error.message;

        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("required") ||
          errorMessage.includes("not in created status")
        ) {
          return reply.code(400).send({
            success: false,
            error: "Bad Request",
            message: errorMessage,
          });
        }
      }

      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to set order addresses",
      });
    }
  }

  async getAddresses(
    request: FastifyRequest<GetAddressesRequest>,
    reply: FastifyReply
  ) {
    try {
      const { orderId } = request.params;

      if (!orderId || typeof orderId !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Order ID is required and must be a valid string",
        });
      }

      const orderAddress = await this.orderManagementService.getOrderAddress(orderId);

      if (!orderAddress) {
        return reply.code(404).send({
          success: false,
          error: "Not Found",
          message: "Order addresses not found",
        });
      }

      return reply.code(200).send({
        success: true,
        data: {
          orderId: orderAddress.getOrderId(),
          billingAddress: orderAddress.getBillingAddress().toJSON(),
          shippingAddress: orderAddress.getShippingAddress().toJSON(),
          isSameAddress: orderAddress.isSameAddress(),
        },
      });
    } catch (error) {
      request.log.error(error, "Failed to get order addresses");

      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve order addresses",
      });
    }
  }

  async updateBillingAddress(
    request: FastifyRequest<UpdateBillingAddressRequest>,
    reply: FastifyReply
  ) {
    try {
      const { orderId } = request.params;
      const addressData = request.body;

      const orderAddress = await this.orderManagementService.updateBillingAddress(
        orderId,
        addressData
      );

      return reply.code(200).send({
        success: true,
        data: {
          orderId: orderAddress.getOrderId(),
          billingAddress: orderAddress.getBillingAddress().toJSON(),
          shippingAddress: orderAddress.getShippingAddress().toJSON(),
          isSameAddress: orderAddress.isSameAddress(),
        },
        message: "Billing address updated successfully",
      });
    } catch (error) {
      request.log.error(error, "Failed to update billing address");

      if (error instanceof Error) {
        const errorMessage = error.message;

        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("required")
        ) {
          return reply.code(400).send({
            success: false,
            error: "Bad Request",
            message: errorMessage,
          });
        }
      }

      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to update billing address",
      });
    }
  }

  async updateShippingAddress(
    request: FastifyRequest<UpdateShippingAddressRequest>,
    reply: FastifyReply
  ) {
    try {
      const { orderId } = request.params;
      const addressData = request.body;

      const orderAddress = await this.orderManagementService.updateShippingAddress(
        orderId,
        addressData
      );

      return reply.code(200).send({
        success: true,
        data: {
          orderId: orderAddress.getOrderId(),
          billingAddress: orderAddress.getBillingAddress().toJSON(),
          shippingAddress: orderAddress.getShippingAddress().toJSON(),
          isSameAddress: orderAddress.isSameAddress(),
        },
        message: "Shipping address updated successfully",
      });
    } catch (error) {
      request.log.error(error, "Failed to update shipping address");

      if (error instanceof Error) {
        const errorMessage = error.message;

        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("required")
        ) {
          return reply.code(400).send({
            success: false,
            error: "Bad Request",
            message: errorMessage,
          });
        }
      }

      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to update shipping address",
      });
    }
  }
}
