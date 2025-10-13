// Shared Command Types (only export class, not interfaces)
export { CommandResult } from './register-user.command.js';

// Export type-only interfaces
export type { ICommand, ICommandHandler } from './register-user.command.js';
export type { RegisterUserCommand } from './register-user.command.js';
export type { LoginUserCommand } from './login-user.command.js';
export type { UpdateProfileCommand } from './update-profile.command.js';
export type { AddAddressCommand } from './add-address.command.js';
export type { UpdateAddressCommand } from './update-address.command.js';
export type { DeleteAddressCommand } from './delete-address.command.js';
export type { AddPaymentMethodCommand } from './add-payment-method.command.js';
export type { UpdatePaymentMethodCommand } from './update-payment-method.command.js';
export type { DeletePaymentMethodCommand } from './delete-payment-method.command.js';

// Export Handler classes (runtime exports)
export { RegisterUserHandler } from './register-user.command.js';
export { LoginUserHandler } from './login-user.command.js';
export { UpdateProfileHandler } from './update-profile.command.js';
export { AddAddressHandler } from './add-address.command.js';
export { UpdateAddressHandler } from './update-address.command.js';
export { DeleteAddressHandler } from './delete-address.command.js';
export { AddPaymentMethodHandler } from './add-payment-method.command.js';
export { UpdatePaymentMethodHandler } from './update-payment-method.command.js';
export { DeletePaymentMethodHandler } from './delete-payment-method.command.js';