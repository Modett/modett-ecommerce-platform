import { FastifyInstance } from "fastify";
import {
  SupportTicketController,
  SupportAgentController,
  ChatSessionController,
  ReturnRequestController,
  RepairController,
  GoodwillRecordController,
  CustomerFeedbackController,
  TicketMessageController,
  ChatMessageController,
  ReturnItemController,
} from "./controllers";
import { SupportTicketService } from "../../application/services/support-ticket.service";
import { TicketMessageService } from "../../application/services/ticket-message.service";
import { SupportAgentService } from "../../application/services/support-agent.service";
import { ChatSessionService } from "../../application/services/chat-session.service";
import { ChatMessageService } from "../../application/services/chat-message.service";
import { ReturnRequestService } from "../../application/services/return-request.service";
import { ReturnItemService } from "../../application/services/return-item.service";
import { RepairService } from "../../application/services/repair.service";
import { GoodwillRecordService } from "../../application/services/goodwill-record.service";
import { CustomerFeedbackService } from "../../application/services/customer-feedback.service";
import {
  authenticateUser,
  optionalAuth,
  authenticateAdmin,
} from "../../../user-management/infra/http/middleware/auth.middleware";

// Standard error responses for Swagger/OpenAPI
const errorResponses = {
  400: {
    description: "Bad request - validation failed",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Validation failed" },
      errors: { type: "array", items: { type: "string" } },
    },
  },
  401: {
    description: "Unauthorized - authentication required",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Authentication required" },
    },
  },
  404: {
    description: "Not found",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Resource not found" },
    },
  },
  500: {
    description: "Internal server error",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Internal server error" },
    },
  },
};

// Route registration function
export async function registerCustomerCareRoutes(
  fastify: FastifyInstance,
  services: {
    supportTicketService: SupportTicketService;
    ticketMessageService: TicketMessageService;
    supportAgentService: SupportAgentService;
    chatSessionService: ChatSessionService;
    chatMessageService: ChatMessageService;
    returnRequestService: ReturnRequestService;
    returnItemService: ReturnItemService;
    repairService: RepairService;
    goodwillRecordService: GoodwillRecordService;
    customerFeedbackService: CustomerFeedbackService;
  }
) {
  // Initialize controllers
  const supportTicketController = new SupportTicketController(
    services.supportTicketService
  );
  const ticketMessageController = new TicketMessageController(
    services.ticketMessageService
  );
  const supportAgentController = new SupportAgentController(
    services.supportAgentService
  );
  const chatSessionController = new ChatSessionController(
    services.chatSessionService
  );
  const chatMessageController = new ChatMessageController(
    services.chatMessageService
  );
  const returnRequestController = new ReturnRequestController(
    services.returnRequestService
  );
  const returnItemController = new ReturnItemController(
    services.returnItemService
  );
  const repairController = new RepairController(services.repairService);
  const goodwillRecordController = new GoodwillRecordController(
    services.goodwillRecordService
  );
  const customerFeedbackController = new CustomerFeedbackController(
    services.customerFeedbackService
  );

  // =============================================================================
  // SUPPORT TICKET ROUTES
  // =============================================================================

  // Create support ticket
  fastify.post(
    "/customer-care/tickets",
    {
      preHandler: optionalAuth,
      schema: {
        description: "Create a new support ticket",
        tags: ["Customer Care - Tickets"],
        summary: "Create Support Ticket",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["source", "subject"],
          properties: {
            userId: { type: "string", format: "uuid" },
            orderId: { type: "string", format: "uuid" },
            source: {
              type: "string",
              enum: ["phone", "email", "chat", "web"],
              description: "Ticket source channel",
            },
            subject: {
              type: "string",
              minLength: 1,
              maxLength: 500,
              description: "Ticket subject",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
              description: "Ticket priority level",
            },
          },
        },
        response: {
          201: {
            description: "Support ticket created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    supportTicketController.createTicket.bind(supportTicketController) as any
  );

  // Get support ticket by ID
  fastify.get(
    "/customer-care/tickets/:ticketId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get support ticket by ID",
        tags: ["Customer Care - Tickets"],
        summary: "Get Support Ticket",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["ticketId"],
          properties: {
            ticketId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Support ticket details",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
            },
          },
          ...errorResponses,
        },
      },
    },
    supportTicketController.getTicket.bind(supportTicketController) as any
  );

  // List support tickets
  fastify.get(
    "/customer-care/tickets",
    {
      preHandler: authenticateUser,
      schema: {
        description: "List all support tickets",
        tags: ["Customer Care - Tickets"],
        summary: "List Support Tickets",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "List of support tickets",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "array" },
              total: { type: "integer" },
            },
          },
          ...errorResponses,
        },
      },
    },
    supportTicketController.listTickets.bind(supportTicketController) as any
  );

  // =============================================================================
  // TICKET MESSAGE ROUTES
  // =============================================================================

  // Add message to ticket
  fastify.post(
    "/customer-care/tickets/:ticketId/messages",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Add a message to a support ticket",
        tags: ["Customer Care - Tickets"],
        summary: "Add Ticket Message",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["ticketId"],
          properties: {
            ticketId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["sender", "message"],
          properties: {
            sender: {
              type: "string",
              enum: ["customer", "agent"],
              description: "Message sender type",
            },
            message: {
              type: "string",
              minLength: 1,
              description: "Message content",
            },
          },
        },
        response: {
          201: {
            description: "Message added successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    ticketMessageController.addMessage.bind(ticketMessageController) as any
  );

  // Get ticket messages
  fastify.get(
    "/customer-care/tickets/:ticketId/messages",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get all messages for a ticket",
        tags: ["Customer Care - Tickets"],
        summary: "Get Ticket Messages",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["ticketId"],
          properties: {
            ticketId: { type: "string", format: "uuid" },
          },
        },
        querystring: {
          type: "object",
          properties: {
            sender: {
              type: "string",
              enum: ["customer", "agent"],
              description: "Filter by sender type",
            },
          },
        },
        response: {
          200: {
            description: "List of ticket messages",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "array" },
              total: { type: "integer" },
            },
          },
          ...errorResponses,
        },
      },
    },
    ticketMessageController.getMessages.bind(ticketMessageController) as any
  );

  // =============================================================================
  // SUPPORT AGENT ROUTES
  // =============================================================================

  // Create support agent
  fastify.post(
    "/customer-care/agents",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Create a new support agent",
        tags: ["Customer Care - Agents"],
        summary: "Create Support Agent",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              description: "Agent name",
            },
            roster: {
              type: "array",
              items: { type: "string" },
              description: "Agent roster/schedule",
            },
            skills: {
              type: "array",
              items: { type: "string" },
              description: "Agent skills",
            },
          },
        },
        response: {
          201: {
            description: "Support agent created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    supportAgentController.createAgent.bind(supportAgentController) as any
  );

  // Get support agent by ID
  fastify.get(
    "/customer-care/agents/:agentId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get support agent by ID",
        tags: ["Customer Care - Agents"],
        summary: "Get Support Agent",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["agentId"],
          properties: {
            agentId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Support agent details",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
            },
          },
          ...errorResponses,
        },
      },
    },
    supportAgentController.getAgent.bind(supportAgentController) as any
  );

  // Update support agent
  fastify.patch(
    "/customer-care/agents/:agentId",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Update support agent details",
        tags: ["Customer Care - Agents"],
        summary: "Update Support Agent",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["agentId"],
          properties: {
            agentId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            roster: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        response: {
          200: {
            description: "Support agent updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    supportAgentController.updateAgent.bind(supportAgentController) as any
  );

  // List support agents
  fastify.get(
    "/customer-care/agents",
    {
      preHandler: authenticateUser,
      schema: {
        description: "List all support agents",
        tags: ["Customer Care - Agents"],
        summary: "List Support Agents",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "List of support agents",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "array" },
              total: { type: "integer" },
            },
          },
          ...errorResponses,
        },
      },
    },
    supportAgentController.listAgents.bind(supportAgentController) as any
  );

  // =============================================================================
  // CHAT SESSION ROUTES
  // =============================================================================

  // Create chat session
  fastify.post(
    "/customer-care/chat-sessions",
    {
      preHandler: optionalAuth,
      schema: {
        description: "Create a new chat session",
        tags: ["Customer Care - Chat"],
        summary: "Create Chat Session",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
            topic: { type: "string", maxLength: 500 },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
            },
          },
        },
        response: {
          201: {
            description: "Chat session created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    chatSessionController.createSession.bind(chatSessionController) as any
  );

  // Get chat session by ID
  fastify.get(
    "/customer-care/chat-sessions/:sessionId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get chat session by ID",
        tags: ["Customer Care - Chat"],
        summary: "Get Chat Session",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["sessionId"],
          properties: {
            sessionId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Chat session details",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
            },
          },
          ...errorResponses,
        },
      },
    },
    chatSessionController.getSession.bind(chatSessionController) as any
  );

  // End chat session
  fastify.post(
    "/customer-care/chat-sessions/:sessionId/end",
    {
      preHandler: authenticateUser,
      schema: {
        description: "End a chat session",
        tags: ["Customer Care - Chat"],
        summary: "End Chat Session",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["sessionId"],
          properties: {
            sessionId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Chat session ended successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    chatSessionController.endSession.bind(chatSessionController) as any
  );

  // List chat sessions
  fastify.get(
    "/customer-care/chat-sessions",
    {
      preHandler: authenticateUser,
      schema: {
        description: "List all chat sessions",
        tags: ["Customer Care - Chat"],
        summary: "List Chat Sessions",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "List of chat sessions",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "array" },
              total: { type: "integer" },
            },
          },
          ...errorResponses,
        },
      },
    },
    chatSessionController.listSessions.bind(chatSessionController) as any
  );

  // =============================================================================
  // CHAT MESSAGE ROUTES
  // =============================================================================

  // Add message to chat session
  fastify.post(
    "/customer-care/chat-sessions/:sessionId/messages",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Add a message to a chat session",
        tags: ["Customer Care - Chat"],
        summary: "Add Chat Message",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["sessionId"],
          properties: {
            sessionId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["senderId", "senderType", "content"],
          properties: {
            senderId: { type: "string", format: "uuid" },
            senderType: {
              type: "string",
              enum: ["customer", "agent", "bot"],
            },
            content: { type: "string", minLength: 1 },
            messageType: { type: "string" },
            isAutomated: { type: "boolean" },
          },
        },
        response: {
          201: {
            description: "Message added successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    chatMessageController.addMessage.bind(chatMessageController) as any
  );

  // Get chat messages
  fastify.get(
    "/customer-care/chat-sessions/:sessionId/messages",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get all messages for a chat session",
        tags: ["Customer Care - Chat"],
        summary: "Get Chat Messages",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["sessionId"],
          properties: {
            sessionId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "List of chat messages",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "array" },
              total: { type: "integer" },
            },
          },
          ...errorResponses,
        },
      },
    },
    chatMessageController.getMessages.bind(chatMessageController) as any
  );

  // =============================================================================
  // RETURN REQUEST ROUTES
  // =============================================================================

  // Create return request
  fastify.post(
    "/customer-care/returns",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Create a new return request",
        tags: ["Customer Care - Returns"],
        summary: "Create Return Request",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["orderId", "type"],
          properties: {
            orderId: { type: "string", format: "uuid" },
            type: {
              type: "string",
              enum: ["return", "exchange", "repair"],
            },
            reason: { type: "string", maxLength: 1000 },
          },
        },
        response: {
          201: {
            description: "Return request created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    returnRequestController.createReturnRequest.bind(
      returnRequestController
    ) as any
  );

  // Get return request by ID
  fastify.get(
    "/customer-care/returns/:rmaId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get return request by RMA ID",
        tags: ["Customer Care - Returns"],
        summary: "Get Return Request",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["rmaId"],
          properties: {
            rmaId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Return request details",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
            },
          },
          ...errorResponses,
        },
      },
    },
    returnRequestController.getReturnRequest.bind(
      returnRequestController
    ) as any
  );

  // List return requests
  fastify.get(
    "/customer-care/returns",
    {
      preHandler: authenticateUser,
      schema: {
        description: "List all return requests",
        tags: ["Customer Care - Returns"],
        summary: "List Return Requests",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "List of return requests",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "array" },
              total: { type: "integer" },
            },
          },
          ...errorResponses,
        },
      },
    },
    returnRequestController.listReturnRequests.bind(
      returnRequestController
    ) as any
  );

  // =============================================================================
  // RETURN ITEM ROUTES
  // =============================================================================

  // Add item to return request
  fastify.post(
    "/customer-care/returns/:rmaId/items",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Add an item to a return request",
        tags: ["Customer Care - Returns"],
        summary: "Add Return Item",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["rmaId"],
          properties: {
            rmaId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["orderItemId", "quantity"],
          properties: {
            orderItemId: { type: "string", format: "uuid" },
            quantity: { type: "integer", minimum: 1 },
            condition: {
              type: "string",
              enum: ["new", "opened", "used", "damaged"],
            },
            disposition: {
              type: "string",
              enum: ["refund", "replace", "repair", "discard"],
            },
            fees: { type: "number", minimum: 0 },
            currency: { type: "string", default: "USD" },
          },
        },
        response: {
          201: {
            description: "Return item added successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    returnItemController.addReturnItem.bind(returnItemController) as any
  );

  // Get return items
  fastify.get(
    "/customer-care/returns/:rmaId/items",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get all items for a return request",
        tags: ["Customer Care - Returns"],
        summary: "Get Return Items",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["rmaId"],
          properties: {
            rmaId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "List of return items",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "array" },
              total: { type: "integer" },
            },
          },
          ...errorResponses,
        },
      },
    },
    returnItemController.getReturnItem.bind(returnItemController) as any
  );

  // Update return item condition
  fastify.patch(
    "/customer-care/returns/:rmaId/items/:orderItemId/condition",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Update return item condition",
        tags: ["Customer Care - Returns"],
        summary: "Update Return Item Condition",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["rmaId", "orderItemId"],
          properties: {
            rmaId: { type: "string", format: "uuid" },
            orderItemId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["condition"],
          properties: {
            condition: {
              type: "string",
              enum: ["new", "opened", "used", "damaged"],
            },
          },
        },
        response: {
          200: {
            description: "Return item condition updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    returnItemController.updateReturnItemCondition.bind(
      returnItemController
    ) as any
  );

  // =============================================================================
  // REPAIR ROUTES
  // =============================================================================

  // Create repair
  fastify.post(
    "/customer-care/repairs",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Create a new repair request",
        tags: ["Customer Care - Repairs"],
        summary: "Create Repair",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["orderItemId"],
          properties: {
            orderItemId: { type: "string", format: "uuid" },
            notes: { type: "string", maxLength: 1000 },
          },
        },
        response: {
          201: {
            description: "Repair created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    repairController.createRepair.bind(repairController) as any
  );

  // Get repair by ID
  fastify.get(
    "/customer-care/repairs/:repairId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get repair by ID",
        tags: ["Customer Care - Repairs"],
        summary: "Get Repair",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["repairId"],
          properties: {
            repairId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Repair details",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
            },
          },
          ...errorResponses,
        },
      },
    },
    repairController.getRepair.bind(repairController) as any
  );

  // Update repair status
  fastify.patch(
    "/customer-care/repairs/:repairId/status",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Update repair status",
        tags: ["Customer Care - Repairs"],
        summary: "Update Repair Status",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["repairId"],
          properties: {
            repairId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["pending", "in_progress", "completed", "cancelled"],
            },
          },
        },
        response: {
          200: {
            description: "Repair status updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    repairController.updateRepairStatus.bind(repairController) as any
  );

  // List repairs
  fastify.get(
    "/customer-care/repairs",
    {
      preHandler: authenticateUser,
      schema: {
        description: "List all repairs",
        tags: ["Customer Care - Repairs"],
        summary: "List Repairs",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "List of repairs",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "array" },
              total: { type: "integer" },
            },
          },
          ...errorResponses,
        },
      },
    },
    repairController.listRepairs.bind(repairController) as any
  );

  // =============================================================================
  // GOODWILL RECORD ROUTES
  // =============================================================================

  // Create goodwill record
  fastify.post(
    "/customer-care/goodwill",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Create a new goodwill record",
        tags: ["Customer Care - Goodwill"],
        summary: "Create Goodwill Record",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["type", "value"],
          properties: {
            userId: { type: "string", format: "uuid" },
            orderId: { type: "string", format: "uuid" },
            type: {
              type: "string",
              enum: ["refund", "discount", "credit", "gift"],
            },
            value: { type: "number", minimum: 0 },
            currency: { type: "string", default: "USD" },
            reason: { type: "string", maxLength: 1000 },
          },
        },
        response: {
          201: {
            description: "Goodwill record created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    goodwillRecordController.createRecord.bind(goodwillRecordController) as any
  );

  // Get goodwill record by ID
  fastify.get(
    "/customer-care/goodwill/:goodwillId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get goodwill record by ID",
        tags: ["Customer Care - Goodwill"],
        summary: "Get Goodwill Record",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["goodwillId"],
          properties: {
            goodwillId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Goodwill record details",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
            },
          },
          ...errorResponses,
        },
      },
    },
    goodwillRecordController.getRecord.bind(goodwillRecordController) as any
  );

  // List goodwill records
  fastify.get(
    "/customer-care/goodwill",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "List all goodwill records",
        tags: ["Customer Care - Goodwill"],
        summary: "List Goodwill Records",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "List of goodwill records",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "array" },
              total: { type: "integer" },
            },
          },
          ...errorResponses,
        },
      },
    },
    goodwillRecordController.listRecords.bind(goodwillRecordController) as any
  );

  // =============================================================================
  // CUSTOMER FEEDBACK ROUTES
  // =============================================================================

  // Add customer feedback
  fastify.post(
    "/customer-care/feedback",
    {
      preHandler: optionalAuth,
      schema: {
        description: "Submit customer feedback",
        tags: ["Customer Care - Feedback"],
        summary: "Add Customer Feedback",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
            ticketId: { type: "string", format: "uuid" },
            orderId: { type: "string", format: "uuid" },
            npsScore: {
              type: "integer",
              minimum: 0,
              maximum: 10,
              description: "Net Promoter Score (0-10)",
            },
            csatScore: {
              type: "integer",
              minimum: 1,
              maximum: 5,
              description: "Customer Satisfaction Score (1-5)",
            },
            comment: { type: "string", maxLength: 2000 },
          },
        },
        response: {
          201: {
            description: "Feedback submitted successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          ...errorResponses,
        },
      },
    },
    customerFeedbackController.addFeedback.bind(
      customerFeedbackController
    ) as any
  );

  // Get customer feedback by ID
  fastify.get(
    "/customer-care/feedback/:feedbackId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get customer feedback by ID",
        tags: ["Customer Care - Feedback"],
        summary: "Get Customer Feedback",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["feedbackId"],
          properties: {
            feedbackId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Customer feedback details",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
            },
          },
          ...errorResponses,
        },
      },
    },
    customerFeedbackController.getFeedback.bind(
      customerFeedbackController
    ) as any
  );

  // List customer feedback
  fastify.get(
    "/customer-care/feedback",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "List all customer feedback",
        tags: ["Customer Care - Feedback"],
        summary: "List Customer Feedback",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "List of customer feedback",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "array" },
              total: { type: "integer" },
            },
          },
          ...errorResponses,
        },
      },
    },
    customerFeedbackController.listFeedback.bind(
      customerFeedbackController
    ) as any
  );
}
