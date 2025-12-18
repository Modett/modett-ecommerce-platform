import { PayableIPGConfig } from "../payment-providers/payable-ipg.provider";

export function getPayableIPGConfig(): PayableIPGConfig {
  const merchantId = process.env.PAYABLE_IPG_MERCHANT_ID;
  const apiKey = process.env.PAYABLE_IPG_API_KEY;
  const secretKey = process.env.PAYABLE_IPG_SECRET_KEY || "";
  const environment = (process.env.PAYABLE_IPG_ENVIRONMENT || "sandbox") as
    | "sandbox"
    | "production";
  const currency = process.env.PAYABLE_IPG_CURRENCY || "LKR";

  if (!merchantId || !apiKey) {
    throw new Error(
      "PayableIPG configuration missing. Please set PAYABLE_IPG_MERCHANT_ID and PAYABLE_IPG_API_KEY in your environment variables."
    );
  }

  return {
    merchantId,
    apiKey,
    secretKey,
    environment,
    currency,
  };
}

/**
 * Check if PayableIPG is configured
 */
export function isPayableIPGConfigured(): boolean {
  return !!(
    process.env.PAYABLE_IPG_MERCHANT_ID && process.env.PAYABLE_IPG_API_KEY
  );
}
