import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from './auth.middleware';

/**
 * Require specific roles for route access
 */
export function requireRole(allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED',
        message: 'You must be logged in to access this resource',
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.code(403).send({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `This endpoint requires one of the following roles: ${allowedRoles.join(', ')}. Your role: ${request.user.role}`,
        requiredRoles: allowedRoles,
        userRole: request.user.role,
      });
    }
  };
}

/**
 * Admin-only routes
 */
export function requireAdmin() {
  return requireRole([UserRole.ADMIN]);
}

/**
 * Staff or admin routes
 */
export function requireStaffOrAdmin() {
  return requireRole([UserRole.STAFF, UserRole.ADMIN]);
}

/**
 * Vendor routes (vendors can manage their own products)
 */
export function requireVendor() {
  return requireRole([UserRole.VENDOR, UserRole.ADMIN]);
}

/**
 * Check if user owns a resource OR is an admin
 * Users can access their own data, admins can access all
 */
export function requireOwnershipOrAdmin(
  getUserIdFromRequest: (request: FastifyRequest) => string
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED',
      });
    }

    const resourceUserId = getUserIdFromRequest(request);

    if (
      request.user.role === UserRole.ADMIN ||
      request.user.userId === resourceUserId
    ) {
      return;
    }

    return reply.code(403).send({
      success: false,
      error: 'Forbidden',
      code: 'FORBIDDEN',
      message: 'You can only access your own resources unless you are an admin',
    });
  };
}

/**
 * Check if user owns a resource OR has staff/admin role
 * Users can access their own data, staff/admin can access all
 */
export function requireOwnershipOrStaff(
  getUserIdFromRequest: (request: FastifyRequest) => string | Promise<string>
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED',
      });
    }

    const resourceUserId = await getUserIdFromRequest(request);

    if (
      request.user.role === UserRole.ADMIN ||
      request.user.role === UserRole.STAFF ||
      request.user.userId === resourceUserId
    ) {
      return;
    }

    return reply.code(403).send({
      success: false,
      error: 'Forbidden',
      code: 'FORBIDDEN',
      message: 'You can only access your own resources unless you are staff or admin',
    });
  };
}

/**
 * Block certain roles from accessing a route
 */
export function blockRoles(blockedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.code(401).send({
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED',
      });
    }

    if (blockedRoles.includes(request.user.role)) {
      return reply.code(403).send({
        success: false,
        error: 'Access denied',
        code: 'ROLE_BLOCKED',
        message: `Users with role ${request.user.role} cannot access this resource`,
      });
    }
  };
}
