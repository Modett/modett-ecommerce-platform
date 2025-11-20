import { PrismaClient, CheckoutStatusEnum } from "@prisma/client";
import { CheckoutRepository } from "../../domain/repositories/checkout.repository";
import { CartRepository } from "../../domain/repositories/cart.repository";
import { CheckoutId } from "../../domain/value-objects/checkout-id.vo";

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
    private readonly cartRepository: CartRepository
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
      const paymentIntent = await tx.paymentIntent.findUnique({
        where: { intentId: dto.paymentIntentId },
      });

      if (!paymentIntent) {
        throw new Error("Payment intent not found");
      }

      if (
        paymentIntent.status !== "authorized" &&
        paymentIntent.status !== "captured"
      ) {
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

      await tx.orderAddress.create({
        data: {
          orderId: order.id,
          shippingSnapshot: dto.shippingAddress as any,
          billingSnapshot: (dto.billingAddress || dto.shippingAddress) as any,
        },
      });

      await tx.paymentIntent.update({
        where: { intentId: dto.paymentIntentId },
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
}
