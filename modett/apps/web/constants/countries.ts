/**
 * Country codes and information
 */

export const COUNTRIES = {
  SRI_LANKA: {
    code: 'LK',
    isoCode: 'LKA',
    name: 'Sri Lanka',
    phonePrefix: '+94',
  },
} as const;

export type CountryCode = keyof typeof COUNTRIES;

export const DEFAULT_COUNTRY = COUNTRIES.SRI_LANKA;
