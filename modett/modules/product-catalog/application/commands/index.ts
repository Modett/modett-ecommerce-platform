// Base interfaces
export { ICommand, ICommandHandler, CommandResult } from './Command';

// Product commands
export { CreateProductCommand } from './CreateProductCommand';
export { UpdateProductCommand } from './UpdateProductCommand';
export { DeleteProductCommand } from './DeleteProductCommand';

// Product command handlers
export { CreateProductCommandHandler } from './CreateProductCommandHandler';
export { UpdateProductCommandHandler } from './UpdateProductCommandHandler';
export { DeleteProductCommandHandler } from './DeleteProductCommandHandler';