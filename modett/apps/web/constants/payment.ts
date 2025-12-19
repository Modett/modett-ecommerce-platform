/**
 * Payment methods and related constants
 */

export const PAYMENT_METHODS = {
  CARDS: 'cards',
  MINTPAY: 'mintpay',
  KOKO: 'koko',
  AMEX: 'amex',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export const PAYMENT_PROVIDERS = {
  PAYABLE_IPG: 'payable-ipg',
} as const;

export type PaymentProvider = typeof PAYMENT_PROVIDERS[keyof typeof PAYMENT_PROVIDERS];
