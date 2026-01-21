/**
 * Shipping options and methods
 */

export const SHIPPING_METHODS = {
  HOME: 'home',
  BOUTIQUE: 'boutique',
} as const;

export const SHIPPING_OPTIONS = {
  COLOMBO: 'colombo',
  SUBURBS: 'suburbs',
} as const;

export type ShippingMethod = typeof SHIPPING_METHODS[keyof typeof SHIPPING_METHODS];
export type ShippingOption = typeof SHIPPING_OPTIONS[keyof typeof SHIPPING_OPTIONS];

export const SHIPPING_PRICES = {
  [SHIPPING_OPTIONS.COLOMBO]: 3.00,
  [SHIPPING_OPTIONS.SUBURBS]: 3.00,
} as const;

export const SHIPPING_DESCRIPTIONS = {
  [SHIPPING_OPTIONS.COLOMBO]: 'Colombo 1-15 shipping in 2-3 working days from order confirmation',
  [SHIPPING_OPTIONS.SUBURBS]: 'Suburbs shipping in 3-5 working days from order confirmation',
} as const;
