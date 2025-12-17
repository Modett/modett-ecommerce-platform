import crypto from 'crypto';

export interface PayableIPGConfig {
  merchantId: string;
  apiKey: string;
  secretKey: string;
  environment: 'sandbox' | 'production';
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
      currency: config.currency || 'LKR', // Default to Sri Lankan Rupees
    };

    // Set API URL based on environment
    this.apiUrl =
      config.environment === 'sandbox'
        ? 'https://sandboxipg.payment.payable.lk/ipg/sandbox'
        : 'https://ipg.payment.payable.lk/ipg/pro';
  }

  /**
   * Create a payment session and get redirect URL
   */
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
  }): Promise<PaymentResponse> {
    try {
      // MOCK MODE: Return fake success for development until real API endpoint is available
      const isMockMode = process.env.PAYABLE_IPG_MOCK_MODE === 'true';

      if (isMockMode) {
        console.log('[PayableIPG] MOCK MODE: Simulating successful payment creation');
        const mockTransactionId = `MOCK-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        return {
          success: true,
          transactionId: mockTransactionId,
          redirectUrl: `${params.returnUrl}?mock=true&transactionId=${mockTransactionId}`,
          status: 'PENDING',
          message: 'Mock payment session created (development mode)',
        };
      }

      const [firstName, ...lastNameParts] = params.customerName.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      const paymentData = {
        merchantId: this.config.merchantId,
        apiKey: this.config.apiKey,
        amount: params.amount.toFixed(2),
        currency: this.config.currency,
        orderId: params.orderId,

        // Customer billing information
        billingContactFirstName: firstName,
        billingContactLastName: lastName,
        billingContactEmail: params.customerEmail,
        billingContactPhone: params.customerPhone || '',
        billingAddressStreet: '',
        billingAddressCity: '',
        billingAddressCountry: 'LK',
        billingAddressPostcodeZip: '0000',

        // URLs
        statusReturnUrl: params.returnUrl,
        cancelUrl: params.cancelUrl,
        webhookUrl: params.webhookUrl || '',

        // Integration metadata
        integrationType: 'BACKEND_API',
        integrationVersion: '1.0.0',
        refererUrl: params.returnUrl,
      };

      console.log('[PayableIPG] Creating payment with data:', {
        url: this.apiUrl,
        merchantId: this.config.merchantId,
        amount: paymentData.amount,
        orderId: paymentData.orderId,
      });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      console.log('[PayableIPG] Response status:', response.status);

      const data: any = await response.json();
      console.log('[PayableIPG] Response data:', data);

      if (data.paymentPage) {
        return {
          success: true,
          transactionId: data.transactionId || params.orderId,
          redirectUrl: data.paymentPage,
          status: 'PENDING',
          message: 'Payment session created successfully',
        };
      } else {
        return {
          success: false,
          error: data.error?.message || data.message || 'Failed to create payment session',
        };
      }
    } catch (error: any) {
      console.error('[PayableIPG] Payment creation error:', {
        message: error.message,
        cause: error.cause,
        stack: error.stack,
      });
      return {
        success: false,
        error: error.message || 'Payment creation failed',
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantId: this.config.merchantId,
          apiKey: this.config.apiKey,
          transactionId: transactionId,
        }),
      });

      const data: any = await response.json();

      return {
        success: data.status === 'SUCCESS' || data.status === 'COMPLETED',
        transactionId: data.transactionId,
        status: data.status,
        message: data.message || 'Payment verified',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment verification failed',
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
        reason: reason || 'Customer requested refund',
      };

      if (amount) {
        refundData.amount = amount.toFixed(2);
      }

      const response = await fetch(refundUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
      });

      const data: any = await response.json();

      if (data.success || data.status === 'SUCCESS') {
        return {
          success: true,
          refundId: data.refundId || data.transactionId,
          status: data.status,
          message: 'Refund processed successfully',
        };
      } else {
        return {
          success: false,
          error: data.message || data.error || 'Refund failed',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Refund processing failed',
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
        typeof payload === 'string' ? payload : JSON.stringify(payload);

      const expectedSignature = crypto
        .createHmac('sha256', this.config.secretKey)
        .update(payloadString, 'utf8')
        .digest('hex');

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
      'Visa',
      'Mastercard',
      'American Express',
      'Diners Club',
      'Discover',
    ];
  }

  /**
   * Check if recurring payments are supported for card type
   */
  supportsRecurring(cardType: string): boolean {
    const recurringSupported = ['Visa', 'Mastercard'];
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
