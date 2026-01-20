import { FastifyRequest, FastifyReply } from "fastify";
import { PayableIPGProvider } from "../../payment-providers/payable-ipg.provider";
import { getPayableIPGConfig } from "../../config/payable-ipg.config";
import { PaymentService } from "../../../application/services/payment.service";
import { CheckoutOrderService } from "../../../../cart/application/services/checkout-order.service";

export class PayableIPGController {
  private payableProvider: PayableIPGProvider;

  constructor(
    private readonly paymentService: PaymentService,
    private readonly checkoutOrderService: CheckoutOrderService
  ) {
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

      req.log.info(
        `[DEBUG] createPayment received body: ${JSON.stringify({
          orderId,
          amount,
          shippingAddress,
          billingAddress,
        })}`
      );

      // Create payment intent in your system
      // orderId here is actually checkoutId during checkout flow
      const paymentIntent = await this.paymentService.createPaymentIntent({
        checkoutId: orderId, // This is checkoutId, not orderId
        provider: "payable-ipg",
        amount,
        currency: "LKR",
        userId: user?.userId,
        metadata: {
          shippingAddress,
          billingAddress,
          customerEmail,
          customerName,
          customerPhone,
        },
      });

      // Create payment session with PayableIPG
      const baseUrl = process.env.NGROK_URL || "https://modett.com";
      const webhookUrl = `${baseUrl}/api/v1/payments/payable-ipg/webhook`;

      req.log.info(`[PayableIPG] Webhook URL: ${webhookUrl}`);

      const paymentResponse = await this.payableProvider.createPayment({
        checkoutId: orderId, // Pass the checkoutId so it can be appended to returnUrl
        orderId: paymentIntent.intentId,
        amount,
        customerEmail,
        customerName,
        customerPhone,
        returnUrl:
          returnUrl ||
          `${baseUrl}/api/v1/payments/payable-ipg/return?checkoutId=${orderId}&intentId=${paymentIntent.intentId}`,
        cancelUrl: cancelUrl || `${baseUrl}/payment/cancel`,
        webhookUrl,
        description,
        billingAddress,
        shippingAddress,
      });

      if (paymentResponse.success) {
        // Save the Payable UID (transactionId) or Invoice ID to the Payment Intent for later lookup
        // We use 'clientSecret' field to store this external reference temporarily
        const lookupKey =
          paymentResponse.transactionId || paymentResponse.invoiceId;

        if (lookupKey) {
          await this.paymentService.updatePaymentIntent(
            paymentIntent.intentId,
            {
              clientSecret: lookupKey,
            }
          );
        }

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

      // Process webhook based on PAYable schema
      const {
        statusCode,
        statusMessage,
        payableTransactionId,
        paymentId,
        custom1,
        invoiceNo,
        failureReason,
      } = payload;

      // Lookup the order/intent using the stored reference (paymentId/uid or invoiceNo)
      // Custom1 is unreliable/missing in some cases
      let paymentIntent = null;

      // 1. Try finding by ClientSecret using paymentId (which is the uid we saved)
      if (paymentId) {
        paymentIntent = await (
          this.paymentService as any
        ).paymentIntentRepo.findByClientSecret(paymentId);
      }

      // 2. If not found, try finding by ClientSecret using invoiceNo (fallback if we saved invoiceId)
      if (!paymentIntent && invoiceNo) {
        paymentIntent = await (
          this.paymentService as any
        ).paymentIntentRepo.findByClientSecret(invoiceNo);
      }

      // 3. Fallback to custom1 if available
      if (!paymentIntent && custom1) {
        // custom1 is the Order UUID (which is Intent ID in our system)
        paymentIntent = await this.paymentService.getPaymentIntent(custom1);
      }

      if (!paymentIntent) {
        req.log.error(
          `PayableIPG webhook: Could not find matching PaymentIntent for payload: ${JSON.stringify(payload)}`
        );
        return reply
          .status(404)
          .send({ success: false, error: "Order not found" });
      }

      // Fix: Extract primitive string from Value Object
      const orderUUID = paymentIntent.intentId.getValue();
      const transactionRef = payableTransactionId || paymentId;

      req.log.info(
        `PayableIPG webhook received: Status ${statusCode} (${statusMessage}) for Intent ${orderUUID}`
      );

      // Check for Success (statusCode 1 or "1")
      // OR Check for statusMessage "SUCCESS" (sent by some gateways/versions)
      const isSuccess =
        statusCode == 1 || statusMessage?.toUpperCase() === "SUCCESS";

      if (isSuccess) {
        // Mark payment as successful
        req.log.info(`Processing Successful Payment for Intent ${orderUUID}`);

        // 1. Check current status to handle idempotency
        const currentStatus = paymentIntent.status.getValue();
        req.log.info(`Current Intent Status: ${currentStatus}`);

        if (currentStatus === "captured") {
          req.log.info("Payment already captured. Skipping capture logic.");
        } else {
          // 2. Authorize if needed (Transition: REQUIRES_ACTION -> AUTHORIZED)
          // Check for "requires_action" or "failed" (lowercase) as per VO Enum
          if (
            currentStatus === "requires_action" ||
            currentStatus === "failed"
          ) {
            try {
              await this.paymentService.authorizePayment({
                intentId: orderUUID,
                pspReference: transactionRef,
                userId: undefined,
              });
            } catch (err: any) {
              req.log.warn(
                `Authorization step failed (might have raced): ${err.message}`
              );
              // Proceed to capture check anyway, in case it was authorized in parallel
            }
          }

          // 3. Capture the payment (Transition: AUTHORIZED -> CAPTURED)
          await this.paymentService.capturePayment(orderUUID, transactionRef);
        }

        // 4. Create the Order in the database (Complete Checkout)
        if (paymentIntent.checkoutId) {
          try {
            req.log.info(
              `Creating Order for Checkout ${paymentIntent.checkoutId}`
            );

            // Retrieve address from metadata
            const shippingAddress = paymentIntent.metadata?.shippingAddress;
            const billingAddress = paymentIntent.metadata?.billingAddress;

            // Map to DTO format - use the correct field names from frontend
            const mappedShippingAddress = {
              firstName:
                shippingAddress?.firstName ||
                (paymentIntent.metadata?.customerName || "Guest").split(" ")[0],
              lastName:
                shippingAddress?.lastName ||
                (paymentIntent.metadata?.customerName || "Guest")
                  .split(" ")
                  .slice(1)
                  .join(" ") ||
                "User",
              addressLine1: shippingAddress?.addressLine1 || "N/A",
              addressLine2: shippingAddress?.addressLine2,
              city: shippingAddress?.city || "N/A",
              state: shippingAddress?.state,
              postalCode: shippingAddress?.postalCode || "N/A",
              country: shippingAddress?.country || "LK",
              phone:
                shippingAddress?.phone || paymentIntent.metadata?.customerPhone,
            };

            const mappedBillingAddress = billingAddress
              ? {
                  firstName:
                    billingAddress?.firstName ||
                    mappedShippingAddress.firstName,
                  lastName:
                    billingAddress?.lastName || mappedShippingAddress.lastName,
                  addressLine1:
                    billingAddress?.addressLine1 ||
                    mappedShippingAddress.addressLine1,
                  addressLine2: billingAddress?.addressLine2,
                  city: billingAddress?.city || mappedShippingAddress.city,
                  state: billingAddress?.state,
                  postalCode:
                    billingAddress?.postalCode ||
                    mappedShippingAddress.postalCode,
                  country:
                    billingAddress?.country || mappedShippingAddress.country,
                  phone: billingAddress?.phone || mappedShippingAddress.phone,
                }
              : undefined;

            const orderResult =
              await this.checkoutOrderService.completeCheckoutWithOrder({
                checkoutId: paymentIntent.checkoutId,
                paymentIntentId: orderUUID,
                shippingAddress: mappedShippingAddress as any,
                billingAddress: mappedBillingAddress as any,
                // userId and guestToken derived from Checkout entity inside service
              } as any);

            req.log.info(
              `Order Successfully Created for Checkout ${paymentIntent.checkoutId}. Order ID: ${orderResult.orderId}`
            );
          } catch (err: any) {
            req.log.error(`Order Creation Failed: ${err.message}`);
            // Don't fail webhook - payment is secured. Merchant can intervene.
          }
        }
      } else {
        // Mark payment as failed
        await this.paymentService.failPayment(
          orderUUID,
          failureReason || statusMessage || "Payment failed"
        );
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

  /**
   * Handle PayableIPG return (redirection from gateway)
   * URL: /api/payments/payable-ipg/return
   */
  async handleReturn(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as any;
    const { checkoutId, intentId } = query;

    console.log("[DEBUG] PayableIPG handleReturn hit!", {
      checkoutId,
      intentId,
    });

    // Use the configured frontend URL or default to localhost:3000 for dev
    // In production this might be different, but for this specific "Ngrok bridge" fix,
    // we explicitly want to go to the local frontend.
    const frontendUrl = "http://localhost:3000";

    const redirectUrl = `${frontendUrl}/checkout/success?checkoutId=${checkoutId}&intentId=${intentId}`;

    return reply.redirect(redirectUrl);
  }
}
