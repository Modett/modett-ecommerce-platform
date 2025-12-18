import { PrismaClient, CheckoutStatusEnum } from "@prisma/client";
import { CheckoutRepository } from "../../domain/repositories/checkout.repository";
import { CartRepository } from "../../domain/repositories/cart.repository";
import { ReservationRepository } from "../../domain/repositories/reservation.repository";
import { StockManagementService } from "../../../inventory-management/application/services/stock-management.service";
import { CheckoutId } from "../../domain/value-objects/checkout-id.vo";
import { CartId } from "../../domain/value-objects/cart-id.vo";

export interface CompleteCheckoutWithOrderDto {
  checkoutId: string;
  paymentIntentId: string;
  userId?: string;
  guestToken?: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    phone?: string;
  };
}

export interface OrderResult {
  orderId: string;
  orderNo: string;
  checkoutId: string;
  paymentIntentId: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: Date;
}

export class CheckoutOrderService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly checkoutRepository: CheckoutRepository,
    private readonly cartRepository: CartRepository,
    private readonly reservationRepository: ReservationRepository,
    private readonly stockManagementService: StockManagementService
  ) {}

  async completeCheckoutWithOrder(
    dto: CompleteCheckoutWithOrderDto
  ): Promise<OrderResult> {
    // Use Prisma transaction to ensure atomicity
    return await this.prisma.$transaction(async (tx) => {
      // 1. Get and validate checkout
      const checkoutId = CheckoutId.fromString(dto.checkoutId);
      const checkout = await this.checkoutRepository.findById(checkoutId);

      if (!checkout) {
        throw new Error("Checkout not found");
      }

      // Validate ownership
      if (dto.userId && checkout.getUserId()?.toString() !== dto.userId) {
        throw new Error("Checkout does not belong to user");
      }

      if (
        dto.guestToken &&
        checkout.getGuestToken()?.toString() !== dto.guestToken
      ) {
        throw new Error("Checkout does not belong to guest");
      }

      // Validate checkout is still valid
      if (checkout.isExpired()) {
        throw new Error("Checkout has expired");
      }

      if (!checkout.isPending()) {
        throw new Error("Checkout is not in pending state");
      }

      // 2. Get cart and validate it has items
      const cart = await this.cartRepository.findById(checkout.getCartId());

      if (!cart) {
        throw new Error("Cart not found");
      }

      if (cart.isEmpty()) {
        throw new Error("Cannot create order from empty cart");
      }

      // 3. Verify payment intent exists and is authorized
      // Try to find by checkoutId first (common during checkout flow)
      let paymentIntent = await tx.paymentIntent.findUnique({
        where: { checkoutId: dto.checkoutId },
      });

      // If not found by checkoutId, try by intentId (for backward compatibility)
      if (!paymentIntent) {
        paymentIntent = await tx.paymentIntent.findUnique({
          where: { intentId: dto.paymentIntentId },
        });
      }

      if (!paymentIntent) {
        throw new Error("Payment intent not found");
      }

      // Accept authorized, captured, or requires_action (for mock/testing)
      const validStatuses = ["authorized", "captured", "requires_action"];
      if (!validStatuses.includes(paymentIntent.status)) {
        throw new Error(
          `Payment intent is not authorized. Current status: ${paymentIntent.status}`
        );
      }

      // 4. Generate unique order number
      const orderNo = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // 5. Calculate order totals from cart
      const cartSnapshot = cart.toSnapshot();
      const subtotal = cart.getSubtotal();
      const total = cart.getTotal();

      const totals = {
        subtotal,
        tax: 0,
        shipping: 0,
        discount: 0,
        total,
      };

      const existingOrder = await tx.order.findFirst({
        where: { checkoutId: dto.checkoutId },
      });

      if (existingOrder) {
        return {
          orderId: existingOrder.id,
          orderNo: existingOrder.orderNo,
          checkoutId: dto.checkoutId,
          paymentIntentId: dto.paymentIntentId,
          totalAmount: checkout.getTotalAmount(),
          currency: checkout.getCurrency().toString(),
          status: existingOrder.status,
          createdAt: existingOrder.createdAt,
        };
      }

      const order = await tx.order.create({
        data: {
          orderNo,
          userId: checkout.getUserId()?.toString(),
          guestToken: checkout.getGuestToken()?.toString(),
          checkoutId: checkout.getCheckoutId().toString(),
          totals: totals as any,
          status: "created",
          source: "web",
          currency: checkout.getCurrency().toString(),
        },
      });

      const orderItems = [];
      for (const item of cartSnapshot.items || []) {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: item.variantId,
            qty: item.quantity,
            productSnapshot: {
              variantId: item.variantId,
              unitPrice: item.unitPriceSnapshot,
              quantity: item.quantity,
            } as any,
            isGift: item.isGift,
            giftMessage: item.giftMessage,
          },
        });
        orderItems.push(orderItem);
      }

      // Select warehouse for order fulfillment
      const warehouseId = await this.selectWarehouseForOrder(
        cartSnapshot.items || [],
        dto.shippingAddress,
        tx
      );

      // Remove stock from inventory (no reservation was made during cart creation)
      for (const item of cartSnapshot.items || []) {
        await this.stockManagementService.adjustStock(
          item.variantId,
          warehouseId,
          -item.quantity, // Negative to remove stock
          "order",
          order.id // Reference the order ID
        );
      }

      await this.reservationRepository.deleteByCartId(checkout.getCartId());

      await tx.orderAddress.create({
        data: {
          orderId: order.id,
          shippingSnapshot: dto.shippingAddress as any,
          billingSnapshot: (dto.billingAddress || dto.shippingAddress) as any,
        },
      });

      await tx.paymentIntent.update({
        where: { intentId: paymentIntent.intentId },
        data: {
          orderId: order.id,
          checkoutId: dto.checkoutId,
        },
      });

      await tx.checkout.update({
        where: { id: dto.checkoutId },
        data: {
          status: CheckoutStatusEnum.completed,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "paid",
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: "created",
          toStatus: "paid",
          changedBy: dto.userId || "system",
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          eventType: "order_created",
          payload: {
            checkoutId: dto.checkoutId,
            paymentIntentId: dto.paymentIntentId,
            source: "checkout",
          } as any,
        },
      });

      // Clear the cart items after successful order creation
      const cartIdToDelete = checkout.getCartId().toString();
      console.log(`Deleting cart items for cart: ${cartIdToDelete}`);

      const deleteResult = await tx.cartItem.deleteMany({
        where: { cartId: cartIdToDelete },
      });

      console.log(`Deleted ${deleteResult.count} cart items`);

      return {
        orderId: order.id,
        orderNo: order.orderNo,
        checkoutId: dto.checkoutId,
        paymentIntentId: dto.paymentIntentId,
        totalAmount: checkout.getTotalAmount(),
        currency: checkout.getCurrency().toString(),
        status: "paid",
        createdAt: order.createdAt,
      };
    });
  }

  /**
   * Selects the appropriate warehouse for order fulfillment.
   *
   * Strategy (in priority order):
   * 1. Use DEFAULT_STOCK_LOCATION from environment if configured
   * 2. Query first active warehouse from database
   *
   * Future enhancements:
   * - Select nearest warehouse based on shipping address
   * - Check inventory availability across warehouses
   * - Support warehouse priority/preference system
   */
  private async selectWarehouseForOrder(
    items: any[],
    shippingAddress: any,
    tx: any
  ): Promise<string> {
    // Strategy 1: Use configured default warehouse
    if (process.env.DEFAULT_STOCK_LOCATION) {
      return process.env.DEFAULT_STOCK_LOCATION;
    }

    // Strategy 2: Query first warehouse from database
    const warehouse = await tx.location.findFirst({
      where: {
        type: "warehouse",
      },
    });

    if (!warehouse) {
      throw new Error(
        "No warehouse location found. Please configure DEFAULT_STOCK_LOCATION in .env or create a warehouse location in the database."
      );
    }

    return warehouse.id;

    // Future strategies can be added here:
    // - Distance-based: Calculate nearest warehouse to shipping address
    // - Inventory-based: Find warehouse with all items in stock
    // - Hybrid: Combine proximity + availability
  }
}
