import {
  IOrderRepository,
  OrderQueryOptions,
  OrderFilterOptions
} from "../../domain/repositories/order.repository";
import { Order } from "../../domain/entities/order.entity";
import { OrderId } from "../../domain/value-objects/order-id.vo";
import { OrderNumber } from "../../domain/value-objects/order-number.vo";
import { OrderStatus } from "../../domain/value-objects/order-status.vo";
import { OrderSource } from "../../domain/value-objects/order-source.vo";
import { Currency } from "../../domain/value-objects/currency.vo";
import { OrderTotals } from "../../domain/value-objects/order-totals.vo";

export interface CreateOrderData {
  userId?: string;
  guestToken?: string;
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  status: string;
  source: string;
  currency: string;
}

export class OrderManagementService {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async createOrder(data: CreateOrderData): Promise<Order> {
    // Validate that either userId or guestToken is provided
    if (!data.userId && !data.guestToken) {
      throw new Error("Order must have either userId or guestToken");
    }

    if (data.userId && data.guestToken) {
      throw new Error("Order cannot have both userId and guestToken");
    }

    // Create value objects
    const totals = OrderTotals.create({
      subtotal: data.totals.subtotal,
      tax: data.totals.tax,
      shipping: data.totals.shipping,
      discount: data.totals.discount,
      total: data.totals.total
    });
    const status = OrderStatus.create(data.status);
    const source = OrderSource.create(data.source);
    const currency = Currency.create(data.currency);

    // Create the order entity
    const order = Order.create({
      userId: data.userId,
      guestToken: data.guestToken,
      totals,
      status,
      source,
      currency,
    });

    // Save the order
    await this.orderRepository.save(order);

    return order;
  }

  async getOrderById(id: string): Promise<Order | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("Order ID is required");
    }

    try {
      const orderId = OrderId.create(id);
      return await this.orderRepository.findById(orderId);
    } catch (error) {
      if (error instanceof Error && error.message.includes("valid UUID")) {
        throw new Error("Invalid order ID format");
      }
      throw error;
    }
  }

  async getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
    if (!orderNumber || orderNumber.trim().length === 0) {
      throw new Error("Order number is required");
    }

    try {
      const orderNum = OrderNumber.create(orderNumber.trim());
      return await this.orderRepository.findByOrderNumber(orderNum);
    } catch (error) {
      throw error;
    }
  }

  async getOrdersByUserId(
    userId: string,
    options?: OrderQueryOptions
  ): Promise<Order[]> {
    if (!userId || userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    return await this.orderRepository.findByUserId(userId, options);
  }

  async getOrdersByGuestToken(
    guestToken: string,
    options?: OrderQueryOptions
  ): Promise<Order[]> {
    if (!guestToken || guestToken.trim().length === 0) {
      throw new Error("Guest token is required");
    }

    return await this.orderRepository.findByGuestToken(guestToken, options);
  }

  async getOrdersByStatus(
    status: string,
    options?: OrderQueryOptions
  ): Promise<Order[]> {
    if (!status || status.trim().length === 0) {
      throw new Error("Status is required");
    }

    const orderStatus = OrderStatus.create(status);
    return await this.orderRepository.findByStatus(orderStatus, options);
  }

  async getAllOrders(
    options?: OrderQueryOptions & {
      page?: number;
      limit?: number;
      userId?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ items: Order[]; totalCount: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      userId,
      status,
      startDate,
      endDate,
    } = options || {};

    const offset = (page - 1) * limit;

    let orders: Order[];
    let totalCount: number;

    // Build filter options
    const filters: OrderFilterOptions = {};
    if (userId) filters.userId = userId;
    if (status) filters.status = OrderStatus.create(status);
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const queryOptions: OrderQueryOptions = {
      limit,
      offset,
      sortBy,
      sortOrder,
    };

    // Use filters if any are provided
    if (Object.keys(filters).length > 0) {
      orders = await this.orderRepository.findWithFilters(filters, queryOptions);
      totalCount = await this.orderRepository.count(filters);
    } else {
      orders = await this.orderRepository.findAll(queryOptions);
      totalCount = await this.orderRepository.count();
    }

    return {
      items: orders,
      totalCount,
    };
  }

  async updateOrderStatus(
    id: string,
    newStatus: string
  ): Promise<Order | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("Order ID is required");
    }

    const order = await this.getOrderById(id);
    if (!order) {
      return null;
    }

    const status = OrderStatus.create(newStatus);
    order.changeStatus(status);

    await this.orderRepository.update(order);

    return order;
  }

  async updateOrderTotals(
    id: string,
    totalsData: {
      subtotal: number;
      discount: number;
      tax: number;
      shipping: number;
      total: number;
    }
  ): Promise<Order | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("Order ID is required");
    }

    const order = await this.getOrderById(id);
    if (!order) {
      return null;
    }

    const totals = OrderTotals.create({
      subtotal: totalsData.subtotal,
      tax: totalsData.tax,
      shipping: totalsData.shipping,
      discount: totalsData.discount,
      total: totalsData.total
    });

    order.updateTotals(totals);

    await this.orderRepository.update(order);

    return order;
  }

  async markOrderAsPaid(id: string): Promise<Order | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("Order ID is required");
    }

    const order = await this.getOrderById(id);
    if (!order) {
      return null;
    }

    order.markAsPaid();

    await this.orderRepository.update(order);

    return order;
  }

  async markOrderAsFulfilled(id: string): Promise<Order | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("Order ID is required");
    }

    const order = await this.getOrderById(id);
    if (!order) {
      return null;
    }

    order.markAsFulfilled();

    await this.orderRepository.update(order);

    return order;
  }

  async cancelOrder(id: string): Promise<Order | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("Order ID is required");
    }

    const order = await this.getOrderById(id);
    if (!order) {
      return null;
    }

    order.cancel();

    await this.orderRepository.update(order);

    return order;
  }

  async refundOrder(id: string): Promise<Order | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("Order ID is required");
    }

    const order = await this.getOrderById(id);
    if (!order) {
      return null;
    }

    order.refund();

    await this.orderRepository.update(order);

    return order;
  }

  async deleteOrder(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error("Order ID is required");
    }

    const order = await this.getOrderById(id);
    if (!order) {
      return false;
    }

    try {
      const orderId = OrderId.create(id);
      await this.orderRepository.delete(orderId);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes("constraint")) {
        throw new Error(
          "Cannot delete order: it has associated items or other dependencies"
        );
      }
      throw error;
    }
  }

  async getOrderCount(filters?: OrderFilterOptions): Promise<number> {
    return await this.orderRepository.count(filters);
  }

  async getOrderCountByStatus(status: string): Promise<number> {
    if (!status || status.trim().length === 0) {
      throw new Error("Status is required");
    }

    const orderStatus = OrderStatus.create(status);
    return await this.orderRepository.countByStatus(orderStatus);
  }

  async getOrderCountByUserId(userId: string): Promise<number> {
    if (!userId || userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    return await this.orderRepository.countByUserId(userId);
  }

  async orderExists(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error("Order ID is required");
    }

    const orderId = OrderId.create(id);
    return await this.orderRepository.exists(orderId);
  }
}
