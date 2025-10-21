// Base interfaces (type-only exports)
export type { IQuery, IQueryHandler } from './get-user-profile.query.js';

// Query interfaces (type-only exports)
export type { GetUserProfileQuery } from './get-user-profile.query.js';
export type { ListAddressesQuery } from './list-addresses.query.js';
export type { ListPaymentMethodsQuery } from './list-payment-methods.query.js';
export type { GetUserByEmailQuery } from './get-user-by-email.query.js';
export type { GetUserDetailsQuery } from './get-user-details.query.js';

// Query Handler classes (runtime exports)
export { GetUserProfileHandler } from './get-user-profile.query.js';
export { ListAddressesHandler } from './list-addresses.query.js';
export { ListPaymentMethodsHandler } from './list-payment-methods.query.js';
export { GetUserByEmailHandler } from './get-user-by-email.query.js';
export { GetUserDetailsHandler } from './get-user-details.query.js';