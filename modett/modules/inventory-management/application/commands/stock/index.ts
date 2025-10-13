// Base Command Types - export once from add-stock.command to avoid ambiguity
export type { ICommand, ICommandHandler } from "./add-stock.command";
export { CommandResult } from "./add-stock.command";

// Stock Commands - export interfaces as types and classes normally
export type { AddStockCommand } from "./add-stock.command";
export { AddStockCommandHandler } from "./add-stock.command";
export type { AdjustStockCommand } from "./adjust-stock.command";
export { AdjustStockCommandHandler } from "./adjust-stock.command";
export type { TransferStockCommand } from "./transfer-stock.command";
export { TransferStockCommandHandler } from "./transfer-stock.command";
export type { ReserveStockCommand } from "./reserve-stock.command";
export { ReserveStockCommandHandler } from "./reserve-stock.command";
export type { ReleaseReservationCommand } from "./release-reservation.command";
export { ReleaseReservationCommandHandler } from "./release-reservation.command";
export type { FulfillReservationCommand } from "./fulfill-reservation.command";
export { FulfillReservationCommandHandler } from "./fulfill-reservation.command";
export type { SetStockThresholdsCommand } from "./set-stock-thresholds.command";
export { SetStockThresholdsCommandHandler } from "./set-stock-thresholds.command";
