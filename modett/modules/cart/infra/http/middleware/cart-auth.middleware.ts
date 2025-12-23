import { FastifyRequest, FastifyReply } from "fastify";

// Extend FastifyRequest to include guestToken
declare module "fastify" {
  interface FastifyRequest {
    guestToken?: string;
  }
}

export async function extractGuestToken(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Check for guest token in header
  const guestTokenHeader = request.headers["x-guest-token"] as string;

  if (guestTokenHeader) {
    // Validate guest token format (64-char hex string)
    const guestTokenRegex = /^[a-f0-9]{64}$/i;
    if (!guestTokenRegex.test(guestTokenHeader)) {
      return reply.status(400).send({
        success: false,
        error:
          "Invalid guest token format. Must be a 64-character hexadecimal string",
        code: "INVALID_GUEST_TOKEN",
      });
    }

    // Check if user is also authenticated (cannot be both)
    if (request.user) {
      return reply.status(400).send({
        success: false,
        error:
          "Cannot provide both Authorization token and X-Guest-Token header",
        code: "MULTIPLE_AUTH_METHODS",
      });
    }

    request.guestToken = guestTokenHeader;
  }
}

export async function requireCartAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Must have either authenticated user OR guest token
  if (!request.user && !request.guestToken) {
    reply.status(401).send({
      success: false,
      error:
        "Authentication required. Provide either Authorization header (for users) or X-Guest-Token header (for guests)",
      code: "AUTHENTICATION_REQUIRED",
    });
    return;
  }
}

export function getCartIdentifier(request: FastifyRequest): {
  userId?: string;
  guestToken?: string;
} {
  if (request.user) {
    return { userId: request.user.userId };
  }
  if (request.guestToken) {
    return { guestToken: request.guestToken };
  }
  return {};
}
