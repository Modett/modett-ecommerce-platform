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
      // Debug logging - log all headers
      console.log("[AUTH DEBUG] ========================================");
      console.log("[AUTH DEBUG] Request URL:", request.url);
      console.log("[AUTH DEBUG] Request Method:", request.method);
      console.log("[AUTH DEBUG] All Headers:", JSON.stringify(request.headers, null, 2));

      // Extract token from Authorization header FIRST (priority), then check cookies
      let authHeader = request.headers.authorization;

      console.log("[AUTH DEBUG] Authorization Header:", authHeader ? `Present (${authHeader.substring(0, 20)}...)` : "MISSING");

      // Only check cookies if Authorization header is not present
      if (!authHeader && request.headers.cookie) {
        console.log("[AUTH DEBUG] No Authorization header, checking cookies...");
        const cookieMatch = request.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
        if (cookieMatch) {
          const tokenFromCookie = cookieMatch[1];
          console.log("[AUTH DEBUG] Token found in cookie:", tokenFromCookie.substring(0, 20) + "...");
          // Format it as Bearer token for consistent processing
          authHeader = `Bearer ${tokenFromCookie}`;
        } else {
          console.log("[AUTH DEBUG] No token found in cookies");
        }
      } else if (authHeader) {
        console.log("[AUTH DEBUG] Using Authorization header (ignoring any cookies)");
      }

      if (!authHeader) {
        console.log("[AUTH DEBUG] No authorization header or cookie token found!");
        console.log("[AUTH DEBUG] Optional auth:", optional);
        if (optional) {
          console.log("[AUTH DEBUG] Continuing without authentication");
          return; // Continue without authentication
        }
        console.log("[AUTH DEBUG] Sending 401 response - MISSING_AUTH_HEADER");
        reply.status(401).send({
          success: false,
          error: "Authorization header or token cookie is required",
          code: "MISSING_AUTH_HEADER",
        });
        return;
      }

      // Validate Bearer token format
      console.log("[AUTH DEBUG] Validating Bearer token format...");
      const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
      if (!tokenMatch) {
        console.log("[AUTH DEBUG] Invalid token format! Expected 'Bearer <token>'");
        console.log("[AUTH DEBUG] Received format:", authHeader.substring(0, 50));
        if (optional) {
          console.log("[AUTH DEBUG] Continuing without authentication");
          return; // Invalid format but optional, continue without auth
        }
        console.log("[AUTH DEBUG] Sending 401 response - INVALID_AUTH_FORMAT");
        reply.status(401).send({
          success: false,
          error:
            "Invalid authorization header format. Expected: Bearer <token>",
          code: "INVALID_AUTH_FORMAT",
        });
        return;
      }

      const token = tokenMatch[1];
      console.log("[AUTH DEBUG] Token extracted successfully:", token.substring(0, 20) + "...");

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
      console.log("[AUTH DEBUG] Verifying JWT token...");
      console.log("[AUTH DEBUG] JWT_SECRET:", JWT_SECRET ? `SET (${JWT_SECRET.substring(0, 5)}...)` : "NOT SET");
      console.log("[AUTH DEBUG] JWT_ALGORITHM:", JWT_ALGORITHM);
      console.log("[AUTH DEBUG] Token to verify:", token.substring(0, 50) + "...");

      // Try to decode without verification first to see the payload
      try {
        const decoded_unverified = jwt.decode(token, { complete: true });
        console.log("[AUTH DEBUG] Token decoded (unverified):", JSON.stringify(decoded_unverified, null, 2));
      } catch (e) {
        console.log("[AUTH DEBUG] Could not decode token:", e);
      }

      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET, {
          algorithms: [JWT_ALGORITHM],
        });
        console.log("[AUTH DEBUG] JWT verified successfully");
        console.log("[AUTH DEBUG] Decoded payload:", JSON.stringify(decoded, null, 2));
      } catch (jwtError: any) {
        console.log("[AUTH DEBUG] JWT verification failed!");
        console.log("[AUTH DEBUG] Error name:", jwtError.name);
        console.log("[AUTH DEBUG] Error message:", jwtError.message);
        console.log("[AUTH DEBUG] Full error:", jwtError);
        if (optional) {
          console.log("[AUTH DEBUG] Continuing without authentication");
          return; // Invalid token but optional, continue without auth
        }

        const errorMessage =
          jwtError.name === "TokenExpiredError"
            ? "Token has expired"
            : jwtError.name === "JsonWebTokenError"
              ? "Invalid token"
              : "Token verification failed";

        console.log("[AUTH DEBUG] Sending 401 response -", jwtError.name);
        reply.status(401).send({
          success: false,
          error: errorMessage,
          code: jwtError.name || "JWT_ERROR",
        });
        return;
      }

      // Validate token payload structure
      console.log("[AUTH DEBUG] Validating token payload structure...");
      console.log("[AUTH DEBUG] Has userId?", !!decoded.userId);
      console.log("[AUTH DEBUG] Has email?", !!decoded.email);
      console.log("[AUTH DEBUG] Decoded keys:", Object.keys(decoded));

      if (!decoded.userId && !decoded.id) {
        console.log("[AUTH DEBUG] Missing userId or id in token payload!");
        if (optional) {
          console.log("[AUTH DEBUG] Continuing without authentication");
          return; // Invalid payload but optional, continue without auth
        }
        console.log("[AUTH DEBUG] Sending 401 response - INVALID_TOKEN_PAYLOAD");
        reply.status(401).send({
          success: false,
          error: "Invalid token payload - missing userId or id",
          code: "INVALID_TOKEN_PAYLOAD",
        });
        return;
      }

      // Support both 'userId' and 'id' field names
      const userId = decoded.userId || decoded.id;
      const email = decoded.email || "unknown@example.com"; // Make email optional for now

      // Create user object
      const user: AuthenticatedUser = {
        userId: userId,
        email: email,
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

      console.log("[AUTH DEBUG] Authentication successful!");
      console.log("[AUTH DEBUG] User ID:", user.userId);
      console.log("[AUTH DEBUG] User Email:", user.email);
      console.log("[AUTH DEBUG] User Status:", user.status);
      console.log("[AUTH DEBUG] ========================================");

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
