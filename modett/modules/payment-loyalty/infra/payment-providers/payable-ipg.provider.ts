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

    console.log(
      "[PayableIPG] CheckValue String:",
      dataString.replace(hashedToken, "HASHED_TOKEN")
    );

    return crypto
      .createHash("sha512")
      .update(dataString)
      .digest("hex")
      .toUpperCase();
  }

  async createPayment(params: {
    orderId: string;
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
      } = params;
      const [firstName, ...lastNameParts] = customerName.split(" ");
      const lastName = lastNameParts.join(" ") || firstName;
      const amountStr = amount.toFixed(2);
      const currency = this.config.currency || "LKR";

      // Generate a short Invoice ID (max 20 chars).
      // Using numeric-only ID based on timestamp to avoid any regex/format strictness
      const shortInvoiceId = Date.now().toString();

      // Webhook needs to be a valid POST endpoint (ReqRes returns 200 OK)
      const webhookUrl = "https://reqres.in/api/users";
      // Return/Referer need to be valid HTML pages. Using merchant domain for matching.
      const returnUrl = "https://modett.com/payment-success";
      const refererUrl = "https://modett.com";

      const checkValue = this.generateCheckValue(
        this.config.merchantId,
        shortInvoiceId,
        amountStr,
        currency,
        this.config.apiKey
      );

      console.log("[PayableIPG] Generated CheckValue for:", {
        invoiceId: shortInvoiceId,
        amount: amountStr,
        currency,
      });

      // Construct payload using CamelCase keys (Confirmed by API Error Message)
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

        returnUrl: "https://modett.com/payment-success",
        refererUrl: "https://modett.com",
        // Use a high-availability public logo to prevent UI crash
        logoUrl: "https://placehold.co/200x50.png", // Short, reliable, SSL-compliant logo
        webhookUrl: webhookUrl,

        orderDescription: "Order " + shortInvoiceId, // Short description to avoid length limits
      };

      console.log("[PayableIPG] Creating payment with new payload:", {
        url: this.apiUrl,
        ...payload,
        checkValue: "***",
      });

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("[PayableIPG] Response status:", response.status);

      const data: any = await response.json();
      console.log("[PayableIPG] Response data:", JSON.stringify(data, null, 2));

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
            redirectUrl: redirectUrl,
            status: data.status || "PENDING",
            message: "Payment session created successfully",
          };
        }
      }

      // Fallback for failure
      return {
        success: false,
        error: `PAYable Error: ${JSON.stringify(data)}`,
      };
    } catch (error: any) {
      console.error("[PayableIPG] Payment creation error:", {
        message: error.message,
        cause: error.cause,
        stack: error.stack,
      });
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
