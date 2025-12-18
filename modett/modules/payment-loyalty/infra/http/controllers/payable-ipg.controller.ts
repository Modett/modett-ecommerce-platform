import { FastifyRequest, FastifyReply } from "fastify";
import { PayableIPGProvider } from "../../payment-providers/payable-ipg.provider";
import { getPayableIPGConfig } from "../../config/payable-ipg.config";
import { PaymentService } from "../../../application/services/payment.service";

export class PayableIPGController {
  private payableProvider: PayableIPGProvider;

  constructor(private readonly paymentService: PaymentService) {
    const config = getPayableIPGConfig();
    this.payableProvider = new PayableIPGProvider(config);
  }

  /**
   * Create PayableIPG payment session
   *
   * POST /api/payments/payable-ipg/create
   */
  async createPayment(req: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        orderId,
        amount,
        customerEmail,
        customerName,
        customerPhone,
        returnUrl,
        cancelUrl,
        description,
        billingAddress,
        shippingAddress,
      } = req.body as any;

      // Get the user from the authenticated request
      const user = (req as any).user;

      // Create payment intent in your system
      // orderId here is actually checkoutId during checkout flow
      const paymentIntent = await this.paymentService.createPaymentIntent({
        checkoutId: orderId, // This is checkoutId, not orderId
        provider: "payable-ipg",
        amount,
        currency: "LKR",
        userId: user?.userId,
      });

      // Create payment session with PayableIPG
      const baseUrl = `${req.protocol}://${req.hostname}`;
      const webhookUrl = `${baseUrl}/api/payments/payable-ipg/webhook`;

      const paymentResponse = await this.payableProvider.createPayment({
        orderId: paymentIntent.intentId,
        amount,
        customerEmail,
        customerName,
        customerPhone,
        returnUrl: returnUrl || `${baseUrl}/payment/success`,
        cancelUrl: cancelUrl || `${baseUrl}/payment/cancel`,
        webhookUrl,
        description,
        billingAddress,
        shippingAddress,
      });

      if (paymentResponse.success) {
        return reply.status(200).send({
          success: true,
          data: {
            intentId: paymentIntent.intentId,
            transactionId: paymentResponse.transactionId,
            redirectUrl: paymentResponse.redirectUrl,
            status: paymentResponse.status,
          },
        });
      } else {
        return reply.status(400).send({
          success: false,
          error: paymentResponse.error || "Failed to create payment",
        });
      }
    } catch (error: any) {
      req.log.error(error);
      return reply.status(500).send({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  /**
   * Handle PayableIPG webhook
   *
   * POST /api/payments/payable-ipg/webhook
   */
  async handleWebhook(req: FastifyRequest, reply: FastifyReply) {
    try {
      const payload = req.body as any;
      const signature = req.headers["x-payable-signature"] as string;

      // Validate webhook signature (if secret key is configured)
      const hasSecretKey =
        process.env.PAYABLE_IPG_SECRET_KEY &&
        process.env.PAYABLE_IPG_SECRET_KEY.length > 0;

      if (hasSecretKey && signature) {
        const isValid = this.payableProvider.validateWebhookSignature(
          payload,
          signature
        );

        if (!isValid) {
          req.log.warn("Invalid PayableIPG webhook signature");
          return reply.status(401).send({
            success: false,
            error: "Invalid signature",
          });
        }
        req.log.info("PayableIPG webhook signature validated successfully");
      } else {
        req.log.warn(
          "PayableIPG webhook signature validation skipped (no secret key configured)"
        );
      }

      // Process webhook based on event type
      const { event, transactionId, orderId, status, amount } = payload;

      req.log.info(
        `PayableIPG webhook received: ${event} for ${transactionId}`
      );

      switch (event) {
        case "payment.success":
        case "payment.completed":
          // Mark payment as successful
          await this.paymentService.capturePayment(
            orderId, // This is actually the intentId we passed
            transactionId
          );
          break;

        case "payment.failed":
          // Mark payment as failed
          await this.paymentService.failPayment(
            orderId,
            payload.failureReason || "Payment failed"
          );
          break;

        case "payment.cancelled":
          // Cancel payment
          await this.paymentService.cancelPayment(orderId);
          break;

        case "refund.completed":
          // Handle refund completion
          req.log.info(`Refund completed for transaction ${transactionId}`);
          break;

        default:
          req.log.warn(`Unknown PayableIPG webhook event: ${event}`);
      }

      return reply.status(200).send({
        success: true,
        message: "Webhook processed",
      });
    } catch (error: any) {
      req.log.error(error);
      return reply.status(500).send({
        success: false,
        error: error.message || "Webhook processing failed",
      });
    }
  }

  /**
   * Verify payment status
   *
   * GET /api/payments/payable-ipg/verify/:transactionId
   */
  async verifyPayment(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { transactionId } = req.params as any;

      const result = await this.payableProvider.verifyPayment(transactionId);

      return reply.status(200).send({
        success: result.success,
        data: result,
      });
    } catch (error: any) {
      req.log.error(error);
      return reply.status(500).send({
        success: false,
        error: error.message || "Verification failed",
      });
    }
  }

  /**
   * Process refund
   *
   * POST /api/payments/payable-ipg/refund
   */
  async refundPayment(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { transactionId, amount, reason } = req.body as any;

      const result = await this.payableProvider.refundPayment(
        transactionId,
        amount,
        reason
      );

      if (result.success) {
        return reply.status(200).send({
          success: true,
          data: result,
        });
      } else {
        return reply.status(400).send({
          success: false,
          error: result.error || "Refund failed",
        });
      }
    } catch (error: any) {
      req.log.error(error);
      return reply.status(500).send({
        success: false,
        error: error.message || "Refund processing failed",
      });
    }
  }

  /**
   * Get supported card types
   *
   * GET /api/payments/payable-ipg/card-types
   */
  async getCardTypes(req: FastifyRequest, reply: FastifyReply) {
    try {
      const cardTypes = this.payableProvider.getSupportedCardTypes();

      return reply.status(200).send({
        success: true,
        data: {
          cardTypes,
          recurringSupport: {
            visa: true,
            mastercard: true,
            amex: false,
            diners: false,
            discover: false,
          },
        },
      });
    } catch (error: any) {
      req.log.error(error);
      return reply.status(500).send({
        success: false,
        error: error.message || "Failed to get card types",
      });
    }
  }
}
