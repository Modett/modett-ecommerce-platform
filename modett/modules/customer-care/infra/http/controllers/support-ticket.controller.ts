import { FastifyRequest, FastifyReply } from "fastify";
import {
  CreateSupportTicketCommand,
  CreateSupportTicketHandler,
} from "../../../application/commands/create-support-ticket.command";
import {
  GetSupportTicketQuery,
  GetSupportTicketHandler,
} from "../../../application/queries/get-support-ticket.query";
import {
  ListSupportTicketsQuery,
  ListSupportTicketsHandler,
} from "../../../application/queries/list-support-tickets.query";
import { SupportTicketService } from "../../../application/services/support-ticket.service";

interface CreateSupportTicketRequest {
  userId?: string;
  orderId?: string;
  source: string;
  subject: string;
  priority?: string;
}

export class SupportTicketController {
  private createSupportTicketHandler: CreateSupportTicketHandler;
  private getSupportTicketHandler: GetSupportTicketHandler;
  private listSupportTicketsHandler: ListSupportTicketsHandler;

  constructor(private readonly supportTicketService: SupportTicketService) {
    this.createSupportTicketHandler = new CreateSupportTicketHandler(
      supportTicketService
    );
    this.getSupportTicketHandler = new GetSupportTicketHandler(
      supportTicketService
    );
    this.listSupportTicketsHandler = new ListSupportTicketsHandler(
      supportTicketService
    );
  }

  async createTicket(
    request: FastifyRequest<{ Body: CreateSupportTicketRequest }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, orderId, source, subject, priority } = request.body;
      const command: CreateSupportTicketCommand = {
        userId,
        orderId,
        source,
        subject,
        priority,
      };
      const result = await this.createSupportTicketHandler.handle(command);
      if (result.success && result.data) {
        return reply.code(201).send({
          success: true,
          data: result.data,
          message: "Support ticket created successfully",
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to create support ticket",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to create support ticket");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to create support ticket",
      });
    }
  }

  async getTicket(
    request: FastifyRequest<{ Params: { ticketId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { ticketId } = request.params;
      if (!ticketId || typeof ticketId !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Ticket ID is required and must be a valid string",
        });
      }
      const query: GetSupportTicketQuery = { ticketId };
      const result = await this.getSupportTicketHandler.handle(query);
      if (result.success && result.data) {
        return reply.code(200).send({
          success: true,
          data: result.data,
        });
      } else if (result.success && result.data === null) {
        return reply.code(404).send({
          success: false,
          error: "Support ticket not found",
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to retrieve support ticket",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to get support ticket");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve support ticket",
      });
    }
  }

  async listTickets(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query: ListSupportTicketsQuery = {};
      const result = await this.listSupportTicketsHandler.handle(query);
      if (result.success && result.data) {
        return reply.code(200).send({
          success: true,
          data: result.data,
          total: result.data.length,
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to list support tickets",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to list support tickets");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to list support tickets",
      });
    }
  }
}
