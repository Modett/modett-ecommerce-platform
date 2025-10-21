import { FastifyRequest, FastifyReply } from "fastify";
import {
  CreateWishlistCommand,
  CreateWishlistHandler,
  AddToWishlistCommand,
  AddToWishlistHandler,
  RemoveFromWishlistCommand,
  RemoveFromWishlistHandler,
  UpdateWishlistCommand,
  UpdateWishlistHandler,
  DeleteWishlistCommand,
  DeleteWishlistHandler,
} from "../../../application/commands/index.js";
import {
  GetWishlistQuery,
  GetWishlistHandler,
  GetUserWishlistsQuery,
  GetUserWishlistsHandler,
  GetPublicWishlistsQuery,
  GetPublicWishlistsHandler,
  GetWishlistItemsQuery,
  GetWishlistItemsHandler,
} from "../../../application/queries/index.js";
import { WishlistManagementService } from "../../../application/services/index.js";

interface CreateWishlistRequest {
  userId?: string;
  guestToken?: string;
  name?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  description?: string;
}

interface AddToWishlistRequest {
  variantId: string;
}

interface UpdateWishlistRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export class WishlistController {
  private createWishlistHandler: CreateWishlistHandler;
  private addToWishlistHandler: AddToWishlistHandler;
  private removeFromWishlistHandler: RemoveFromWishlistHandler;
  private updateWishlistHandler: UpdateWishlistHandler;
  private deleteWishlistHandler: DeleteWishlistHandler;
  private getWishlistHandler: GetWishlistHandler;
  private getUserWishlistsHandler: GetUserWishlistsHandler;
  private getPublicWishlistsHandler: GetPublicWishlistsHandler;
  private getWishlistItemsHandler: GetWishlistItemsHandler;

  constructor(private readonly wishlistService: WishlistManagementService) {
    this.createWishlistHandler = new CreateWishlistHandler(wishlistService);
    this.addToWishlistHandler = new AddToWishlistHandler(wishlistService);
    this.removeFromWishlistHandler = new RemoveFromWishlistHandler(
      wishlistService
    );
    this.updateWishlistHandler = new UpdateWishlistHandler(wishlistService);
    this.deleteWishlistHandler = new DeleteWishlistHandler(wishlistService);
    this.getWishlistHandler = new GetWishlistHandler(wishlistService);
    this.getUserWishlistsHandler = new GetUserWishlistsHandler(
      wishlistService
    );
    this.getPublicWishlistsHandler = new GetPublicWishlistsHandler(
      wishlistService
    );
    this.getWishlistItemsHandler = new GetWishlistItemsHandler(
      wishlistService
    );
  }

  async createWishlist(
    request: FastifyRequest<{ Body: CreateWishlistRequest }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, guestToken, name, isDefault, isPublic, description } =
        request.body;

      const command: CreateWishlistCommand = {
        userId: request.user?.userId || userId,
        guestToken: guestToken || (request.headers["x-guest-token"] as string),
        name,
        isDefault,
        isPublic,
        description,
      };

      const result = await this.createWishlistHandler.handle(command);

      if (result.success && result.data) {
        return reply.code(201).send({
          success: true,
          data: result.data,
          message: "Wishlist created successfully",
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to create wishlist",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to create wishlist");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to create wishlist",
      });
    }
  }

  async getWishlist(
    request: FastifyRequest<{ Params: { wishlistId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { wishlistId } = request.params;

      if (!wishlistId || typeof wishlistId !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Wishlist ID is required and must be a valid string",
        });
      }

      const query: GetWishlistQuery = { wishlistId };
      const result = await this.getWishlistHandler.handle(query);

      if (result.success && result.data) {
        return reply.code(200).send({
          success: true,
          data: result.data,
        });
      } else if (result.success && result.data === null) {
        return reply.code(404).send({
          success: false,
          error: "Wishlist not found",
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to retrieve wishlist",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to get wishlist");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve wishlist",
      });
    }
  }

  async getUserWishlists(
    request: FastifyRequest<{
      Params: { userId: string };
      Querystring: { limit?: string; offset?: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params;
      const { limit, offset } = request.query;

      if (!userId || typeof userId !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "User ID is required and must be a valid string",
        });
      }

      const query: GetUserWishlistsQuery = {
        userId,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      };

      const result = await this.getUserWishlistsHandler.handle(query);

      if (result.success && result.data) {
        return reply.code(200).send({
          success: true,
          data: result.data,
          total: result.data.length,
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to retrieve user wishlists",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to get user wishlists");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve user wishlists",
      });
    }
  }

  async getPublicWishlists(
    request: FastifyRequest<{
      Querystring: { limit?: string; offset?: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { limit, offset } = request.query;

      const query: GetPublicWishlistsQuery = {
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      };

      const result = await this.getPublicWishlistsHandler.handle(query);

      if (result.success && result.data) {
        return reply.code(200).send({
          success: true,
          data: result.data,
          total: result.data.length,
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to retrieve public wishlists",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to get public wishlists");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve public wishlists",
      });
    }
  }

  async getWishlistItems(
    request: FastifyRequest<{
      Params: { wishlistId: string };
      Querystring: { limit?: string; offset?: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { wishlistId } = request.params;
      const { limit, offset } = request.query;

      if (!wishlistId || typeof wishlistId !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Wishlist ID is required and must be a valid string",
        });
      }

      const query: GetWishlistItemsQuery = {
        wishlistId,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      };

      const result = await this.getWishlistItemsHandler.handle(query);

      if (result.success && result.data) {
        return reply.code(200).send({
          success: true,
          data: result.data,
          total: result.data.length,
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to retrieve wishlist items",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to get wishlist items");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve wishlist items",
      });
    }
  }

  async addToWishlist(
    request: FastifyRequest<{
      Params: { wishlistId: string };
      Body: AddToWishlistRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { wishlistId } = request.params;
      const { variantId } = request.body;

      const command: AddToWishlistCommand = {
        wishlistId,
        variantId,
      };

      const result = await this.addToWishlistHandler.handle(command);

      if (result.success && result.data) {
        return reply.code(201).send({
          success: true,
          data: result.data,
          message: "Item added to wishlist successfully",
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to add item to wishlist",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to add item to wishlist");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to add item to wishlist",
      });
    }
  }

  async removeFromWishlist(
    request: FastifyRequest<{
      Params: { wishlistId: string; wishlistItemId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { wishlistId, wishlistItemId } = request.params;

      const command: RemoveFromWishlistCommand = {
        wishlistId,
        variantId: wishlistItemId,
      };

      const result = await this.removeFromWishlistHandler.handle(command);

      if (result.success) {
        return reply.code(200).send({
          success: true,
          message: "Item removed from wishlist successfully",
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to remove item from wishlist",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to remove item from wishlist");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to remove item from wishlist",
      });
    }
  }

  async updateWishlist(
    request: FastifyRequest<{
      Params: { wishlistId: string };
      Body: UpdateWishlistRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { wishlistId } = request.params;
      const { name, description, isPublic } = request.body;

      const command: UpdateWishlistCommand = {
        wishlistId,
        name,
        description,
        isPublic,
      };

      const result = await this.updateWishlistHandler.handle(command);

      if (result.success) {
        return reply.code(200).send({
          success: true,
          message: "Wishlist updated successfully",
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to update wishlist",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to update wishlist");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to update wishlist",
      });
    }
  }

  async deleteWishlist(
    request: FastifyRequest<{ Params: { wishlistId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { wishlistId } = request.params;

      const command: DeleteWishlistCommand = {
        wishlistId,
      };

      const result = await this.deleteWishlistHandler.handle(command);

      if (result.success) {
        return reply.code(200).send({
          success: true,
          message: "Wishlist deleted successfully",
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Failed to delete wishlist",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to delete wishlist");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to delete wishlist",
      });
    }
  }
}
