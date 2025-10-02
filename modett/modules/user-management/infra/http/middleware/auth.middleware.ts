import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

// User interface for type safety
export interface AuthenticatedUser {
  userId: string;
  email: string;
  status: "active" | "inactive" | "blocked";
  isGuest: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  iat?: number;
  exp?: number;
}

// Extend FastifyRequest to include user
declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

// JWT configuration (should be moved to environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_ALGORITHM = "HS256";

export interface AuthMiddlewareOptions {
  optional?: boolean; // Allow requests without authentication
  requireEmailVerification?: boolean;
  requirePhoneVerification?: boolean;
  allowedStatuses?: Array<"active" | "inactive" | "blocked">;
  allowGuests?: boolean;
}

/**
 * Authentication middleware for Fastify routes
 * Validates JWT tokens and adds user information to the request
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const {
    optional = false,
    requireEmailVerification = false,
    requirePhoneVerification = false,
    allowedStatuses = ["active"],
    allowGuests = false,
  } = options;

  return async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        if (optional) {
          return; // Continue without authentication
        }
        reply.status(401).send({
          success: false,
          error: "Authorization header is required",
          code: "MISSING_AUTH_HEADER",
        });
        return;
      }

      // Validate Bearer token format
      const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
      if (!tokenMatch) {
        if (optional) {
          return; // Invalid format but optional, continue without auth
        }
        reply.status(401).send({
          success: false,
          error:
            "Invalid authorization header format. Expected: Bearer <token>",
          code: "INVALID_AUTH_FORMAT",
        });
        return;
      }

      const token = tokenMatch[1];

      // Check if token is blacklisted (logged out)
      const { TokenBlacklistService } = await import(
        "../security/token-blacklist"
      );
      console.log(`[DEBUG] Checking token blacklist for token: ${token.substring(0, 10)}...`);
      const isBlacklisted = TokenBlacklistService.isTokenBlacklisted(token);
      console.log(`[DEBUG] Token blacklisted: ${isBlacklisted}`);
      if (isBlacklisted) {
        console.log(`[DEBUG] Token is blacklisted, ${optional ? 'continuing without auth' : 'rejecting request'}`);
        if (optional) {
          return; // Blacklisted but optional, continue without auth
        }
        reply.status(401).send({
          success: false,
          error: "Token has been revoked",
          code: "TOKEN_REVOKED",
        });
        return;
      }

      // Verify and decode JWT token
      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET, {
          algorithms: [JWT_ALGORITHM],
        });
      } catch (jwtError: any) {
        if (optional) {
          return; // Invalid token but optional, continue without auth
        }

        const errorMessage =
          jwtError.name === "TokenExpiredError"
            ? "Token has expired"
            : jwtError.name === "JsonWebTokenError"
              ? "Invalid token"
              : "Token verification failed";

        reply.status(401).send({
          success: false,
          error: errorMessage,
          code: jwtError.name || "JWT_ERROR",
        });
        return;
      }

      // Validate token payload structure
      if (!decoded.userId || !decoded.email) {
        if (optional) {
          return; // Invalid payload but optional, continue without auth
        }
        reply.status(401).send({
          success: false,
          error: "Invalid token payload",
          code: "INVALID_TOKEN_PAYLOAD",
        });
        return;
      }

      // Create user object
      const user: AuthenticatedUser = {
        userId: decoded.userId,
        email: decoded.email,
        status: decoded.status || "active",
        isGuest: decoded.isGuest || false,
        emailVerified: decoded.emailVerified || false,
        phoneVerified: decoded.phoneVerified || false,
        iat: decoded.iat,
        exp: decoded.exp,
      };

      // Validate user status
      if (!allowedStatuses.includes(user.status)) {
        reply.status(403).send({
          success: false,
          error: `User status '${user.status}' is not allowed to access this resource`,
          code: "INVALID_USER_STATUS",
        });
        return;
      }

      // Validate guest status
      if (user.isGuest && !allowGuests) {
        reply.status(403).send({
          success: false,
          error: "Guest users are not allowed to access this resource",
          code: "GUESTS_NOT_ALLOWED",
        });
        return;
      }

      // Validate email verification
      if (requireEmailVerification && !user.emailVerified) {
        reply.status(403).send({
          success: false,
          error: "Email verification is required to access this resource",
          code: "EMAIL_VERIFICATION_REQUIRED",
        });
        return;
      }

      // Validate phone verification
      if (requirePhoneVerification && !user.phoneVerified) {
        reply.status(403).send({
          success: false,
          error: "Phone verification is required to access this resource",
          code: "PHONE_VERIFICATION_REQUIRED",
        });
        return;
      }

      // TODO: Additional validations can be added here:
      // - Check if user still exists in database
      // - Check for revoked tokens (token blacklist)
      // - Check for password changes (invalidate old tokens)
      // - Rate limiting per user
      // - Session management

      // Add user to request object
      request.user = user;

      // Continue to route handler
    } catch (error) {
      // Log error for debugging (use proper logging in production)
      console.error("Authentication middleware error:", error);

      reply.status(500).send({
        success: false,
        error: "Internal server error during authentication",
        code: "AUTH_MIDDLEWARE_ERROR",
      });
    }
  };
}

/**
 * Convenience middleware for authenticated routes
 */
export const authenticateUser = createAuthMiddleware({
  optional: false,
  allowedStatuses: ["active"],
});

/**
 * Convenience middleware for optional authentication
 */
export const optionalAuth = createAuthMiddleware({
  optional: true,
  allowedStatuses: ["active", "inactive"],
});

/**
 * Convenience middleware for verified users only
 */
export const authenticateVerifiedUser = createAuthMiddleware({
  optional: false,
  requireEmailVerification: true,
  allowedStatuses: ["active"],
});

/**
 * Convenience middleware that allows guests
 */
export const authenticateWithGuests = createAuthMiddleware({
  optional: false,
  allowGuests: true,
  allowedStatuses: ["active"],
});

/**
 * Admin-only middleware (example)
 */
export const authenticateAdmin = createAuthMiddleware({
  optional: false,
  requireEmailVerification: true,
  allowedStatuses: ["active"],
  // TODO: Add role-based authorization
});

/**
 * Utility function to generate JWT tokens
 */
export function generateAuthTokens(user: Partial<AuthenticatedUser>): {
  accessToken: string;
  refreshToken: string;
} {
  const payload = {
    userId: user.userId,
    email: user.email,
    status: user.status,
    isGuest: user.isGuest,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
  };

  // Access token (short-lived)
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: "120m", // 120 minutes
  });

  // Refresh token (long-lived)
  const refreshToken = jwt.sign(
    { userId: user.userId, type: "refresh" },
    JWT_SECRET,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: "7d", // 7 days
    }
  );

  return { accessToken, refreshToken };
}

/**
 * Utility function to verify refresh tokens
 */
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    }) as any;

    if (decoded.type !== "refresh" || !decoded.userId) {
      return null;
    }

    return { userId: decoded.userId };
  } catch {
    return null;
  }
}
