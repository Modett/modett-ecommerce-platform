import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

// User role enum
export enum UserRole {
  GUEST = "GUEST",
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
  INVENTORY_STAFF = "INVENTORY_STAFF",
  CUSTOMER_SERVICE = "CUSTOMER_SERVICE",
  ANALYST = "ANALYST",
  VENDOR = "VENDOR",
}

// User interface for type safety
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
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
      console.log("[Auth Middleware] Path:", request.url);
      console.log("[Auth Middleware] Authorization header:", request.headers.authorization ? "Present" : "Missing");
      console.log("[Auth Middleware] Cookie header:", request.headers.cookie ? "Present" : "Missing");

      let authHeader = request.headers.authorization;

      if (!authHeader && request.headers.cookie) {
        const cookieMatch = request.headers.cookie.match(
          /(?:^|;\s*)token=([^;]+)/
        );
        if (cookieMatch) {
          console.log("[Auth Middleware] Found token in cookie");
          authHeader = `Bearer ${cookieMatch[1]}`;
        }
      }

      if (!authHeader) {
        console.log("[Auth Middleware] No auth header found, returning 401");
        if (optional) return;
        reply.status(401).send({
          success: false,
          error: "Authorization header or token cookie is required",
          code: "MISSING_AUTH_HEADER",
        });
        return;
      }

      const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
      if (!tokenMatch) {
        if (optional) return;
        reply.status(401).send({
          success: false,
          error:
            "Invalid authorization header format. Expected: Bearer <token>",
          code: "INVALID_AUTH_FORMAT",
        });
        return;
      }

      const token = tokenMatch[1];

      const { TokenBlacklistService } = await import(
        "../security/token-blacklist"
      );
      if (TokenBlacklistService.isTokenBlacklisted(token)) {
        if (optional) return;
        reply.status(401).send({
          success: false,
          error: "Token has been revoked",
          code: "TOKEN_REVOKED",
        });
        return;
      }

      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET, {
          algorithms: [JWT_ALGORITHM],
        });
      } catch (jwtError: any) {
        // Log JWT errors for debugging (even in optional mode)
        console.log("[Auth Middleware] JWT verification failed:", {
          error: jwtError.message,
          optional,
          tokenPrefix: token.substring(0, 20) + "...",
        });
        if (optional) return;

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

      if (!decoded.userId && !decoded.id) {
        if (optional) return;
        reply.status(401).send({
          success: false,
          error: "Invalid token payload",
          code: "INVALID_TOKEN_PAYLOAD",
        });
        return;
      }
      const user: AuthenticatedUser = {
        userId: decoded.userId || decoded.id,
        email: decoded.email || "unknown@example.com",
        role: decoded.role || UserRole.CUSTOMER,
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
          error: `User status '${user.status}' is not allowed`,
          code: "INVALID_USER_STATUS",
        });
        return;
      }

      if (user.isGuest && !allowGuests) {
        reply.status(403).send({
          success: false,
          error: "Guest users are not allowed",
          code: "GUESTS_NOT_ALLOWED",
        });
        return;
      }

      if (requireEmailVerification && !user.emailVerified) {
        reply.status(403).send({
          success: false,
          error: "Email verification is required",
          code: "EMAIL_VERIFICATION_REQUIRED",
        });
        return;
      }

      if (requirePhoneVerification && !user.phoneVerified) {
        reply.status(403).send({
          success: false,
          error: "Phone verification is required",
          code: "PHONE_VERIFICATION_REQUIRED",
        });
        return;
      }

      request.user = user;
    } catch (error) {
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
  allowedStatuses: ["active", "inactive"],
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
 * Role-based authorization middleware
 * Checks if the authenticated user has one of the required roles
 */
export function requireRole(allowedRoles: UserRole[]) {
  return async function roleMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user) {
      reply.status(401).send({
        success: false,
        error: "Authentication required",
        code: "UNAUTHORIZED",
      });
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      reply.status(403).send({
        success: false,
        error: "Insufficient permissions",
        code: "FORBIDDEN",
        requiredRoles: allowedRoles,
        currentRole: request.user.role,
      });
      return;
    }
  };
}

/**
 * Convenience middleware for admin-only routes
 */
export const authenticateAdmin = [
  authenticateUser,
  requireRole([UserRole.ADMIN]),
];

/**
 * Convenience middleware for staff and admin routes
 */
export const authenticateStaff = [
  authenticateUser,
  requireRole([
    UserRole.INVENTORY_STAFF,
    UserRole.CUSTOMER_SERVICE,
    UserRole.ANALYST,
    UserRole.ADMIN,
  ]),
];

/**
 * Convenience middleware for vendor routes
 */
export const authenticateVendor = [
  authenticateUser,
  requireRole([UserRole.VENDOR, UserRole.ADMIN]),
];

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
    role: user.role || UserRole.CUSTOMER,
    status: user.status,
    isGuest: user.isGuest,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: "120m",
  });

  const refreshToken = jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role || UserRole.CUSTOMER,
      type: "refresh",
    },
    JWT_SECRET,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
}

/**
 * Utility function to verify refresh tokens
 */
export function verifyRefreshToken(
  token: string
): { userId: string; email: string; role: UserRole } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    }) as any;

    if (decoded.type !== "refresh" || !decoded.userId) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || UserRole.CUSTOMER,
    };
  } catch {
    return null;
  }
}
