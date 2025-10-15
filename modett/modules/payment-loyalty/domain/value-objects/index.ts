// Payment value objects (used by entities)
// NOTE: Entities import these directly due to TypeScript module resolution issues
// export * from "./payment-intent-status.vo";
// export * from "./payment-transaction-type.vo";

// Gift card value objects (used by entities)
export * from "./gift-card-status.vo";
// export * from "./gift-card-transaction-type.vo";

// Loyalty value objects (used by entities)
export * from "./loyalty-reason.vo";

// Common value objects (used by entities)
export * from "./currency.vo";
export * from "./money.vo";

// Legacy ID value objects (kept for backward compatibility, can be removed if not used elsewhere)
export * from "./payment-intent-id.vo";
export * from "./payment-transaction-id.vo";
export * from "./bnpl-transaction-id.vo";
export * from "./gift-card-id.vo";
export * from "./gift-card-transaction-id.vo";
export * from "./promotion-id.vo";
export * from "./promotion-usage-id.vo";
export * from "./loyalty-account-id.vo";
export * from "./loyalty-program-id.vo";
export * from "./loyalty-transaction-id.vo";
export * from "./webhook-event-id.vo";

// Other legacy value objects (kept for backward compatibility)
export * from "./payment-method.vo";
export * from "./bnpl-provider.vo";
export * from "./bnpl-status.vo";
export * from "./promotion-status.vo";
// export * from "./loyalty-tier.vo"; // Commented out due to name conflict with LoyaltyTier interface in loyalty-program.entity
export * from "./webhook-event-type.vo";
