import { FastifyRequest, FastifyReply } from "fastify";
import { BackorderManagementService } from "../../../application/services/backorder-management.service";
import {
  CreateBackorderCommandHandler,
  CreateBackorderCommand,
} from "../../../application/commands/create-backorder.command";
import {
  UpdateBackorderEtaCommandHandler,
  UpdateBackorderEtaCommand,
} from "../../../application/commands/update-backorder-eta.command";
import {
  MarkBackorderNotifiedCommandHandler,
  MarkBackorderNotifiedCommand,
} from "../../../application/commands/mark-backorder-notified.command";
import {
  DeleteBackorderCommandHandler,
  DeleteBackorderCommand,
} from "../../../application/commands/delete-backorder.command";
import {
  GetBackorderHandler,
  GetBackorderQuery,
} from "../../../application/queries/get-backorder.query";
import {
  ListBackordersHandler,
  ListBackordersQuery,
} from "../../../application/queries/list-backorders.query";

interface CreateBackorderRequest {
  Body: {
    orderItemId: string;
    promisedEta?: string;
  };
}

interface UpdateBackorderEtaRequest {
  Params: { orderItemId: string };
  Body: {
    promisedEta: string;
  };
}

interface MarkBackorderNotifiedRequest {
  Params: { orderItemId: string };
}

interface DeleteBackorderRequest {
  Params: { orderItemId: string };
}

interface GetBackorderRequest {
  Params: { orderItemId: string };
}

interface ListBackordersRequest {
  Querystring: {
    limit?: number;
    offset?: number;
    sortBy?: "promisedEta" | "notifiedAt";
    sortOrder?: "asc" | "desc";
    filterType?: "all" | "notified" | "unnotified" | "overdue";
  };
}

export class BackorderController {
  private createHandler: CreateBackorderCommandHandler;
  private updateEtaHandler: UpdateBackorderEtaCommandHandler;
  private markNotifiedHandler: MarkBackorderNotifiedCommandHandler;
  private deleteHandler: DeleteBackorderCommandHandler;
  private getBackorderHandler: GetBackorderHandler;
  private listBackordersHandler: ListBackordersHandler;

  constructor(private readonly backorderService: BackorderManagementService) {
    this.createHandler = new CreateBackorderCommandHandler(backorderService);
    this.updateEtaHandler = new UpdateBackorderEtaCommandHandler(
      backorderService
    );
    this.markNotifiedHandler = new MarkBackorderNotifiedCommandHandler(
      backorderService
    );
    this.deleteHandler = new DeleteBackorderCommandHandler(backorderService);
    this.getBackorderHandler = new GetBackorderHandler(backorderService);
    this.listBackordersHandler = new ListBackordersHandler(backorderService);
  }

  async createBackorder(
    request: FastifyRequest<CreateBackorderRequest>,
    reply: FastifyReply
  ): Promise<void> {
    const command: CreateBackorderCommand = {
      orderItemId: request.body.orderItemId,
      promisedEta: request.body.promisedEta
        ? new Date(request.body.promisedEta)
        : undefined,
    };

    const result = await this.createHandler.handle(command);

    if (result.success) {
      reply.status(201).send({
        success: true,
        data: result.data?.toJSON(),
        message: "Backorder created successfully",
      });
    } else {
      reply.status(400).send({
        success: false,
        error: result.error,
        errors: result.errors,
      });
    }
  }

  async updatePromisedEta(
    request: FastifyRequest<UpdateBackorderEtaRequest>,
    reply: FastifyReply
  ): Promise<void> {
    const command: UpdateBackorderEtaCommand = {
      orderItemId: request.params.orderItemId,
      promisedEta: new Date(request.body.promisedEta),
    };

    const result = await this.updateEtaHandler.handle(command);

    if (result.success) {
      reply.status(200).send({
        success: true,
        data: result.data?.toJSON(),
        message: "Backorder promised ETA updated successfully",
      });
    } else {
      reply.status(400).send({
        success: false,
        error: result.error,
        errors: result.errors,
      });
    }
  }

  async markNotified(
    request: FastifyRequest<MarkBackorderNotifiedRequest>,
    reply: FastifyReply
  ): Promise<void> {
    const command: MarkBackorderNotifiedCommand = {
      orderItemId: request.params.orderItemId,
    };

    const result = await this.markNotifiedHandler.handle(command);

    if (result.success) {
      reply.status(200).send({
        success: true,
        data: result.data?.toJSON(),
        message: "Backorder marked as notified successfully",
      });
    } else {
      reply.status(400).send({
        success: false,
        error: result.error,
        errors: result.errors,
      });
    }
  }

  async deleteBackorder(
    request: FastifyRequest<DeleteBackorderRequest>,
    reply: FastifyReply
  ): Promise<void> {
    const command: DeleteBackorderCommand = {
      orderItemId: request.params.orderItemId,
    };

    const result = await this.deleteHandler.handle(command);

    if (result.success) {
      reply.status(200).send({
        success: true,
        message: "Backorder deleted successfully",
      });
    } else {
      reply.status(404).send({
        success: false,
        error: result.error,
        errors: result.errors,
      });
    }
  }

  async getBackorder(
    request: FastifyRequest<GetBackorderRequest>,
    reply: FastifyReply
  ): Promise<void> {
    const query: GetBackorderQuery = {
      orderItemId: request.params.orderItemId,
    };

    const result = await this.getBackorderHandler.handle(query);

    if (result.success) {
      reply.status(200).send({
        success: true,
        data: result.data,
      });
    } else {
      reply.status(404).send({
        success: false,
        error: result.error,
        errors: result.errors,
      });
    }
  }

  async listBackorders(
    request: FastifyRequest<ListBackordersRequest>,
    reply: FastifyReply
  ): Promise<void> {
    const query: ListBackordersQuery = {
      limit: request.query.limit,
      offset: request.query.offset,
      sortBy: request.query.sortBy,
      sortOrder: request.query.sortOrder,
      filterType: request.query.filterType,
    };

    const result = await this.listBackordersHandler.handle(query);

    if (result.success) {
      reply.status(200).send({
        success: true,
        data: result.data,
      });
    } else {
      reply.status(400).send({
        success: false,
        error: result.error,
        errors: result.errors,
      });
    }
  }
}
