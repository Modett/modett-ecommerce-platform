import crypto from "crypto";

export interface PayableIPGConfig {
  merchantId: string;
  apiKey: string;
  secretKey: string;
  environment: "sandbox" | "production";
  currency?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  invoiceId?: string;
  redirectUrl?: string;
  status?: string;
  message?: string;
  error?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  status?: string;
  message?: string;
  error?: string;
}

/**
 * PayableIPG Payment Provider Adapter
 *
 * Integrates PAYable Internet Payment Gateway (IPG) for processing:
 * - One-time card payments (Visa, Mastercard, Amex, Diners, Discover)
 * - Recurring card payments (Visa, Mastercard only)
 *
 * Backend implementation using PayableIPG REST API
 */
export class PayableIPGProvider {
  private config: PayableIPGConfig;
  private apiUrl: string;

  constructor(config: PayableIPGConfig) {
    this.config = {
      ...config,
      currency: config.currency || "LKR", // Default to Sri Lankan Rupees
    };

    // Set API URL based on environment
    this.apiUrl =
      config.environment === "sandbox"
        ? "https://payable-apps.web.app/ipg/sandbox"
        : process.env.PAYABLE_IPG_PROD_URL ||
          "https://us-central1-payable-mobile.cloudfunctions.net/ipg/pro";
  }

  private generateCheckValue(
    merchantKey: string,
    invoiceId: string,
    amount: string,
    currency: string,
    token: string
  ): string {
    // 1. Hash the merchant token (SHA512 + Uppercase)
    const hashedToken = crypto
      .createHash("sha512")
      .update(token)
      .digest("hex")
      .toUpperCase();

    const dataString = `${merchantKey}|${invoiceId}|${amount}|${currency}|${hashedToken}`;

    return crypto
      .createHash("sha512")
      .update(dataString)
      .digest("hex")
      .toUpperCase();
  }

  async createPayment(params: {
    checkoutId?: string; // Added checkoutId to params
    orderId: string; // This is actually the Intent ID
    amount: number;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    returnUrl: string;
    cancelUrl: string;
    webhookUrl?: string;
    description?: string;
    billingAddress?: {
      street: string;
      city: string;
      postcode: string;
      country: string;
    };
    shippingAddress?: {
      street: string;
      city: string;
      postcode: string;
      country: string;
    };
  }): Promise<PaymentResponse> {
    try {
      const {
        customerName,
        amount,
        customerEmail,
        customerPhone,
        billingAddress,
        shippingAddress,
        checkoutId,
        orderId, // This is the payment intent ID
      } = params;
      const [firstName, ...lastNameParts] = customerName.split(" ");
      const lastName = lastNameParts.join(" ") || firstName;
      const amountStr = amount.toFixed(2);
      const currency = this.config.currency || "LKR";

      const shortInvoiceId = Date.now().toString();

      const ngrokUrl = process.env.NGROK_URL;

      // When NGROK_URL is set, always use it (for local development)
      // Otherwise, use the provided params or fallback to production domain
      let returnUrl: string;
      let webhookUrl: string;
      let refererUrl: string;

      // Construct query params to append
      const queryParams = new URLSearchParams();
      if (checkoutId) queryParams.append("checkoutId", checkoutId);
      queryParams.append("intentId", orderId);

      const queryString = queryParams.toString();

      if (ngrokUrl) {
        // Use backend redirection endpoint to bridge HTTPS -> HTTP (localhost:3000)
        returnUrl = `${ngrokUrl}/api/v1/payments/payable-ipg/return?${queryString}`;

        // Webhook always goes to backend (Ngrok in dev)
        webhookUrl = `${ngrokUrl}/api/v1/payments/payable-ipg/webhook`;
        refererUrl = "https://modett.com";
      } else {
        const baseUrl =
          params.returnUrl?.split("/checkout")[0] || "https://modett.com";

        if (params.returnUrl) {
          const hasQuery = params.returnUrl.includes("?");
          returnUrl = `${params.returnUrl}${hasQuery ? "&" : "?"}${queryString}`;
        } else {
          returnUrl = `${baseUrl}/checkout/success?${queryString}`;
        }

        webhookUrl =
          params.webhookUrl || `${baseUrl}/api/v1/payments/payable-ipg/webhook`;
        refererUrl = baseUrl;
      }

      const checkValue = this.generateCheckValue(
        this.config.merchantId,
        shortInvoiceId,
        amountStr,
        currency,
        this.config.apiKey
      );
      const payload = {
        merchantKey: this.config.merchantId,
        invoiceId: shortInvoiceId,
        integrationType: "1",
        integrationVersion: "1.0", // Reverting to 1.0 with clean payload
        paymentType: "1", // Changed to string to match integrationType pattern
        amount: amountStr,
        currencyCode: currency,
        checkValue: checkValue,

        customerFirstName: firstName,
        customerLastName: lastName,
        customerEmail: customerEmail,
        customerMobilePhone: customerPhone || "94771234567", // Using 94 format

        // Billing Address
        billingAddressStreet: billingAddress?.street || "123 Galle Road",
        billingAddressCity: billingAddress?.city || "Colombo",
        billingAddressPostcodeZip: billingAddress?.postcode || "00300",
        billingAddressCountry: "LKA",

        // Shipping Address
        shippingAddressStreet: shippingAddress?.street || "123 Galle Road",
        shippingAddressCity: shippingAddress?.city || "Colombo",
        shippingAddressPostcodeZip: shippingAddress?.postcode || "00300",
        shippingAddressCountry: "LKA",

        returnUrl: returnUrl,
        refererUrl: refererUrl,
        logoUrl: "https://placehold.co/200x50.png",
        webhookUrl: webhookUrl,

        custom1: params.orderId,
        orderDescription: "Order " + shortInvoiceId,
      };

      console.log("[DEBUG] Generated Return URL:", returnUrl);
      console.log("[DEBUG] Using Ngrok URL:", ngrokUrl || "undefined");
      console.log(
        "[DEBUG] Full Payment Payload:",
        JSON.stringify(payload, null, 2)
      );

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: any = await response.json();

      if (
        data.isSuccess ||
        (data.status === 200 && data.data?.redirectUrl) ||
        (data.paymentPage && data.uid)
      ) {
        // API might return success in different ways. Assuming data.data.redirectUrl based on standard IPGs or data.paymentPage
        const redirectUrl =
          data.data?.redirectUrl || data.paymentPage || data.redirectUrl;
        const transactionId =
          data.data?.transactionId || data.uid || data.invoiceId;

        if (redirectUrl) {
          return {
            success: true,
            transactionId: transactionId,
            invoiceId: shortInvoiceId, // Returning local invoice ID to save in DB
            redirectUrl: redirectUrl,
            status: data.status || "PENDING",
            message: "Payment session created successfully",
          };
        }
      }

      return {
        success: false,
        error: `PAYable Error: ${JSON.stringify(data)}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Payment creation failed",
      };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    try {
      // PayableIPG verification endpoint
      const verifyUrl = `${this.apiUrl}/verify`;

      const response = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchantId: this.config.merchantId,
          apiKey: this.config.apiKey,
          transactionId: transactionId,
        }),
      });

      const data: any = await response.json();

      return {
        success: data.status === "SUCCESS" || data.status === "COMPLETED",
        transactionId: data.transactionId,
        status: data.status,
        message: data.message || "Payment verified",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Payment verification failed",
      };
    }
  }

  /**
   * Process refund
   */
  async refundPayment(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<RefundResponse> {
    try {
      const refundUrl = `${this.apiUrl}/refund`;

      const refundData: any = {
        merchantId: this.config.merchantId,
        apiKey: this.config.apiKey,
        transactionId,
        reason: reason || "Customer requested refund",
      };

      if (amount) {
        refundData.amount = amount.toFixed(2);
      }

      const response = await fetch(refundUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(refundData),
      });

      const data: any = await response.json();

      if (data.success || data.status === "SUCCESS") {
        return {
          success: true,
          refundId: data.refundId || data.transactionId,
          status: data.status,
          message: "Refund processed successfully",
        };
      } else {
        return {
          success: false,
          error: data.message || data.error || "Refund failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Refund processing failed",
      };
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload: any, signature: string): boolean {
    if (!this.config.secretKey || this.config.secretKey.length === 0) {
      return false;
    }

    try {
      const payloadString =
        typeof payload === "string" ? payload : JSON.stringify(payload);

      const expectedSignature = crypto
        .createHmac("sha256", this.config.secretKey)
        .update(payloadString, "utf8")
        .digest("hex");

      return (
        signature.length === expectedSignature.length &&
        crypto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(expectedSignature)
        )
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Get supported card types
   */
  getSupportedCardTypes(): string[] {
    return [
      "Visa",
      "Mastercard",
      "American Express",
      "Diners Club",
      "Discover",
    ];
  }

  /**
   * Check if recurring payments are supported for card type
   */
  supportsRecurring(cardType: string): boolean {
    const recurringSupported = ["Visa", "Mastercard"];
    return recurringSupported.includes(cardType);
  }
}

/**
 * Factory function to create PayableIPG provider instance
 */
export function createPayableIPGProvider(
  config: PayableIPGConfig
): PayableIPGProvider {
  return new PayableIPGProvider(config);
}
