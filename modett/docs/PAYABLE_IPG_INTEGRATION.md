# PayableIPG Payment Gateway Integration Guide

This guide explains how to integrate and use the PAYable Internet Payment Gateway (IPG) in your e-commerce platform.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Setup & Configuration](#setup--configuration)
4. [Backend Integration](#backend-integration)
5. [Frontend Integration](#frontend-integration)
6. [API Reference](#api-reference)
7. [Testing](#testing)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Overview

PayableIPG is a Sri Lankan payment gateway that enables:
- **One-time card payments** using Visa, Mastercard, Amex, Diners Club, and Discover
- **Recurring payments** (Visa and Mastercard only)
- Secure payment processing with webhook notifications
- Refund processing

**NPM Package**: [payable-ipg-js](https://www.npmjs.com/package/payable-ipg-js)
**Sample Code**: [GitHub Repository](https://github.com/subathanikaikumaran/checkout-payable-npm-js)

---

## Features

✅ **Supported Card Types**:
- Visa (one-time & recurring)
- Mastercard (one-time & recurring)
- American Express
- Diners Club
- Discover

✅ **Payment Operations**:
- Create payment sessions
- Verify payment status
- Process refunds (full & partial)
- Webhook notifications

✅ **Security**:
- Webhook signature validation
- PCI DSS compliant payment flow
- HTTPS encryption

---

## Setup & Configuration

### 1. Install Dependencies

The `payable-ipg-js` package is already installed in your project.

```bash
npm install payable-ipg-js
```

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# PayableIPG Configuration
PAYABLE_IPG_MERCHANT_ID=your_merchant_id_here
PAYABLE_IPG_API_KEY=your_api_key_here
PAYABLE_IPG_SECRET_KEY=your_secret_key_here
PAYABLE_IPG_ENVIRONMENT=sandbox
PAYABLE_IPG_CURRENCY=LKR
```

**Environment Options**:
- `PAYABLE_IPG_ENVIRONMENT`: `sandbox` (testing) or `production`
- `PAYABLE_IPG_CURRENCY`: `LKR` (Sri Lankan Rupees) or other supported currencies

### 3. Obtain Credentials

Contact PAYable support to get your:
- Merchant ID
- API Key
- Secret Key

For testing, use sandbox credentials.

---

## Backend Integration

### Architecture

The integration follows a clean architecture pattern:

```
modules/payment-loyalty/
├── infra/
│   ├── payment-providers/
│   │   └── payable-ipg.provider.ts       # Payment provider adapter
│   ├── config/
│   │   └── payable-ipg.config.ts         # Configuration loader
│   └── http/
│       ├── controllers/
│       │   └── payable-ipg.controller.ts # HTTP controller
│       └── routes.ts                      # API routes
```

### Key Components

#### 1. PayableIPGProvider (`payable-ipg.provider.ts`)

Adapter class that wraps the PayableIPG SDK:

```typescript
import { createPayableIPGProvider } from '../infra/payment-providers/payable-ipg.provider';

const provider = createPayableIPGProvider({
  merchantId: 'your_merchant_id',
  apiKey: 'your_api_key',
  secretKey: 'your_secret_key',
  environment: 'sandbox',
  currency: 'LKR',
});

// Create payment
const result = await provider.createPayment({
  orderId: 'order-123',
  amount: 5000,
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  returnUrl: 'https://yoursite.com/payment/success',
  cancelUrl: 'https://yoursite.com/payment/cancel',
});
```

#### 2. PayableIPGController (`payable-ipg.controller.ts`)

Handles HTTP requests for payment operations:
- Create payment sessions
- Handle webhooks
- Verify payments
- Process refunds

#### 3. API Routes (`routes.ts`)

Registers PayableIPG endpoints:
- `POST /api/payments/payable-ipg/create` - Create payment
- `POST /api/payments/payable-ipg/webhook` - Webhook handler
- `GET /api/payments/payable-ipg/verify/:transactionId` - Verify payment
- `POST /api/payments/payable-ipg/refund` - Process refund
- `GET /api/payments/payable-ipg/card-types` - Get supported cards

---

## Frontend Integration

### Using the React Component

Import and use the `PayableIPGCheckout` component:

```tsx
import { PayableIPGCheckout } from '@/features/checkout/components/payable-ipg-checkout';

export default function CheckoutPage() {
  return (
    <PayableIPGCheckout
      orderId="order-123"
      amount={5000}
      customerEmail="customer@example.com"
      customerName="John Doe"
      customerPhone="+94771234567"
      onSuccess={(data) => console.log('Payment successful', data)}
      onError={(error) => console.error('Payment failed', error)}
    />
  );
}
```

### Using the React Hook

For custom implementations, use the `usePayableIPG` hook:

```tsx
import { usePayableIPG } from '@/features/checkout/hooks/use-payable-ipg';

export default function CustomCheckout() {
  const { createPayment, loading, error } = usePayableIPG();

  const handleCheckout = async () => {
    const result = await createPayment({
      orderId: 'order-123',
      amount: 5000,
      customerEmail: 'customer@example.com',
      customerName: 'John Doe',
    });

    if (result.success) {
      // Redirect to payment gateway
      window.location.href = result.redirectUrl;
    }
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
}
```

---

## API Reference

### 1. Create Payment

**Endpoint**: `POST /api/payments/payable-ipg/create`

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 5000,
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "customerPhone": "+94771234567",
  "returnUrl": "https://yoursite.com/payment/success",
  "cancelUrl": "https://yoursite.com/payment/cancel",
  "description": "Payment for Order #123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "intentId": "550e8400-e29b-41d4-a716-446655440000",
    "transactionId": "payable_txn_12345",
    "redirectUrl": "https://payable.lk/checkout/12345",
    "status": "PENDING"
  }
}
```

### 2. Webhook Handler

**Endpoint**: `POST /api/payments/payable-ipg/webhook`

**Authentication**: None (Signature Validation)

**Headers**:
```
X-Payable-Signature: <webhook_signature>
```

**Request Body**:
```json
{
  "event": "payment.success",
  "transactionId": "payable_txn_12345",
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "COMPLETED",
  "amount": 5000
}
```

**Webhook Events**:
- `payment.success` - Payment completed successfully
- `payment.failed` - Payment failed
- `payment.cancelled` - Payment cancelled by user
- `refund.completed` - Refund processed

### 3. Verify Payment

**Endpoint**: `GET /api/payments/payable-ipg/verify/:transactionId`

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "data": {
    "transactionId": "payable_txn_12345",
    "status": "COMPLETED",
    "message": "Payment successful"
  }
}
```

### 4. Process Refund

**Endpoint**: `POST /api/payments/payable-ipg/refund`

**Authentication**: Required (Staff/Admin only)

**Request Body**:
```json
{
  "transactionId": "payable_txn_12345",
  "amount": 2500,
  "reason": "Customer requested refund"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "refundId": "refund_67890",
    "status": "REFUNDED",
    "message": "Refund processed successfully"
  }
}
```

### 5. Get Card Types

**Endpoint**: `GET /api/payments/payable-ipg/card-types`

**Authentication**: None

**Response**:
```json
{
  "success": true,
  "data": {
    "cardTypes": ["Visa", "Mastercard", "American Express", "Diners Club", "Discover"],
    "recurringSupport": {
      "visa": true,
      "mastercard": true,
      "amex": false,
      "diners": false,
      "discover": false
    }
  }
}
```

---

## Testing

### 1. Test in Sandbox Mode

Set environment to sandbox:
```env
PAYABLE_IPG_ENVIRONMENT=sandbox
```

### 2. Test Cards

Use PAYable's test card numbers (contact PAYable support for test cards).

### 3. Test Webhooks Locally

Use ngrok or similar tools to expose your local server:

```bash
# Start your development server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Update webhook URL in PayableIPG dashboard to ngrok URL
# Example: https://abc123.ngrok.io/api/payments/payable-ipg/webhook
```

### 4. Verify Integration

1. Create a test order
2. Initiate payment
3. Complete payment on PayableIPG page
4. Verify webhook is received
5. Check payment status in your system

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Obtain production credentials from PAYable
- [ ] Update environment variables to production
- [ ] Configure production webhook URL
- [ ] Test payment flow end-to-end
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure SSL certificate (HTTPS required)
- [ ] Review refund policies

### Environment Configuration

```env
PAYABLE_IPG_ENVIRONMENT=production
PAYABLE_IPG_MERCHANT_ID=prod_merchant_id
PAYABLE_IPG_API_KEY=prod_api_key
PAYABLE_IPG_SECRET_KEY=prod_secret_key
```

### Webhook URL

Configure your production webhook URL in PayableIPG dashboard:
```
https://yourdomain.com/api/payments/payable-ipg/webhook
```

### Security Best Practices

1. **Always validate webhook signatures**
2. **Use HTTPS** for all payment endpoints
3. **Store credentials** in environment variables (never commit to Git)
4. **Log all payment transactions** for audit trails
5. **Implement rate limiting** on payment endpoints
6. **Monitor failed payments** and set up alerts

---

## Troubleshooting

### Common Issues

#### 1. "PayableIPG not configured" error

**Solution**: Ensure all environment variables are set:
```bash
# Check if variables are loaded
node -e "console.log(process.env.PAYABLE_IPG_MERCHANT_ID)"
```

#### 2. Webhook signature validation fails

**Solution**:
- Verify secret key matches PayableIPG dashboard
- Check webhook payload format
- Ensure X-Payable-Signature header is present

#### 3. Payment redirect not working

**Solution**:
- Verify return URL and cancel URL are accessible
- Check for CORS issues
- Ensure URLs use HTTPS in production

#### 4. Refund fails

**Solution**:
- Verify transaction is in COMPLETED status
- Check refund amount doesn't exceed original payment
- Ensure sufficient time has passed since payment

### Debug Mode

Enable detailed logging:

```typescript
// In payable-ipg.provider.ts
console.log('Payment request:', paymentData);
console.log('Payment response:', response);
```

### Support

- **PayableIPG Support**: Contact PAYable customer support
- **NPM Package Issues**: [GitHub Issues](https://github.com/subathanikaikumaran/checkout-payable-npm-js/issues)

---

## Example Payment Flow

```
1. User adds items to cart
2. User proceeds to checkout
3. Frontend calls POST /api/payments/payable-ipg/create
4. Backend creates payment intent
5. Backend returns redirectUrl
6. Frontend redirects user to PayableIPG payment page
7. User enters card details on PayableIPG
8. PayableIPG processes payment
9. PayableIPG sends webhook to your server
10. Your server updates payment status
11. PayableIPG redirects user to returnUrl
12. Frontend displays success message
```

---

## Additional Resources

- [PayableIPG NPM Package](https://www.npmjs.com/package/payable-ipg-js)
- [Sample Implementation](https://github.com/subathanikaikumaran/checkout-payable-npm-js)
- PayableIPG Official Documentation (contact support)

---

**Last Updated**: December 2024
**Integration Version**: 1.0.0
**Package Version**: payable-ipg-js@4.1.4
