import { FastifyRequest, FastifyReply } from "fastify";
import { PreorderManagementService } from "../../../application/services/preorder-management.service";
import {
  CreatePreorderCommandHandler,
  CreatePreorderCommand,
} from "../../../application/commands/create-preorder.command";
import {
  UpdatePreorderReleaseDateCommandHandler,
  UpdatePreorderReleaseDateCommand,
} from "../../../application/commands/update-preorder-release-date.command";
import {
  MarkPreorderNotifiedCommandHandler,
  MarkPreorderNotifiedCommand,
} from "../../../application/commands/mark-preorder-notified.command";
import {
  DeletePreorderCommandHandler,
  DeletePreorderCommand,
} from "../../../application/commands/delete-preorder.command";
import {
  GetPreorderHandler,
  GetPreorderQuery,
} from "../../../application/queries/get-preorder.query";
import {
  ListPreordersHandler,
  ListPreordersQuery,
} from "../../../application/queries/list-preorders.query";

interface CreatePreorderRequest {
  Body: {
    orderItemId: string;
    releaseDate?: string;
  };
}

interface UpdatePreorderReleaseDateRequest {
  Params: { orderItemId: string };
  Body: {
    releaseDate: string;
  };
}

interface MarkPreorderNotifiedRequest {
  Params: { orderItemId: string };
}

interface DeletePreorderRequest {
  Params: { orderItemId: string };
}

interface GetPreorderRequest {
  Params: { orderItemId: string };
}

interface ListPreordersRequest {
  Querystring: {
    limit?: number;
    offset?: number;
    sortBy?: "releaseDate" | "notifiedAt";
    sortOrder?: "asc" | "desc";
    filterType?: "all" | "notified" | "unnotified" | "released";
  };
}

export class PreorderController {
  private createHandler: CreatePreorderCommandHandler;
  private updateReleaseDateHandler: UpdatePreorderReleaseDateCommandHandler;
  private markNotifiedHandler: MarkPreorderNotifiedCommandHandler;
  private deleteHandler: DeletePreorderCommandHandler;
  private getPreorderHandler: GetPreorderHandler;
  private listPreordersHandler: ListPreordersHandler;

  constructor(private readonly preorderService: PreorderManagementService) {
    this.createHandler = new CreatePreorderCommandHandler(preorderService);
    this.updateReleaseDateHandler = new UpdatePreorderReleaseDateCommandHandler(
      preorderService
    );
    this.markNotifiedHandler = new MarkPreorderNotifiedCommandHandler(
      preorderService
    );
    this.deleteHandler = new DeletePreorderCommandHandler(preorderService);
    this.getPreorderHandler = new GetPreorderHandler(preorderService);
    this.listPreordersHandler = new ListPreordersHandler(preorderService);
  }

  async createPreorder(
    request: FastifyRequest<CreatePreorderRequest>,
    reply: FastifyReply
  ): Promise<void> {
    const command: CreatePreorderCommand = {
      orderItemId: request.body.orderItemId,
      releaseDate: request.body.releaseDate
        ? new Date(request.body.releaseDate)
        : undefined,
    };

    const result = await this.createHandler.handle(command);

    if (result.success) {
      reply.status(201).send({
        success: true,
        data: result.data?.toJSON(),
        message: "Preorder created successfully",
      });
    } else {
      reply.status(400).send({
        success: false,
        error: result.error,
        errors: result.errors,
      });
    }
  }

  async updateReleaseDate(
    request: FastifyRequest<UpdatePreorderReleaseDateRequest>,
    reply: FastifyReply
  ): Promise<void> {
    const command: UpdatePreorderReleaseDateCommand = {
      orderItemId: request.params.orderItemId,
      releaseDate: new Date(request.body.releaseDate),
    };

    const result = await this.updateReleaseDateHandler.handle(command);

    if (result.success) {
      reply.status(200).send({
        success: true,
        data: result.data?.toJSON(),
        message: "Preorder release date updated successfully",
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
    request: FastifyRequest<MarkPreorderNotifiedRequest>,
    reply: FastifyReply
  ): Promise<void> {
    const command: MarkPreorderNotifiedCommand = {
      orderItemId: request.params.orderItemId,
    };

    const result = await this.markNotifiedHandler.handle(command);

    if (result.success) {
      reply.status(200).send({
        success: true,
        data: result.data?.toJSON(),
        message: "Preorder marked as notified successfully",
      });
    } else {
      reply.status(400).send({
        success: false,
        error: result.error,
        errors: result.errors,
      });
    }
  }

  async deletePreorder(
    request: FastifyRequest<DeletePreorderRequest>,
    reply: FastifyReply
  ): Promise<void> {
    const command: DeletePreorderCommand = {
      orderItemId: request.params.orderItemId,
    };

    const result = await this.deleteHandler.handle(command);

    if (result.success) {
      reply.status(200).send({
        success: true,
        message: "Preorder deleted successfully",
      });
    } else {
      reply.status(404).send({
        success: false,
        error: result.error,
        errors: result.errors,
      });
    }
  }

  async getPreorder(
    request: FastifyRequest<GetPreorderRequest>,
    reply: FastifyReply
  ): Promise<void> {
    const query: GetPreorderQuery = {
      orderItemId: request.params.orderItemId,
    };

    const result = await this.getPreorderHandler.handle(query);

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

  async listPreorders(
    request: FastifyRequest<ListPreordersRequest>,
    reply: FastifyReply
  ): Promise<void> {
    const query: ListPreordersQuery = {
      limit: request.query.limit,
      offset: request.query.offset,
      sortBy: request.query.sortBy,
      sortOrder: request.query.sortOrder,
      filterType: request.query.filterType,
    };

    const result = await this.listPreordersHandler.handle(query);

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
