import jwt from 'jsonwebtoken';
import ErrorResponse from '../utils/error.response.js';
import { getJwtConfig } from '../clients/index.js';

// Cache JWT config to avoid repeated Dapr calls
let _jwtConfigCache = null;

async function getCachedJwtConfig() {
  if (_jwtConfigCache === null) {
    _jwtConfigCache = await getJwtConfig();
  }
  return _jwtConfigCache;
}

/**
 * Middleware for JWT authentication in the admin service.
 * Verifies the Authorization header, decodes the JWT, and attaches the user payload to req.user.
 * Responds with 401 Unauthorized if the token is missing or invalid.
 */
export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new ErrorResponse('Unauthorized: Missing Authorization header', 401));
  }
  if (!authHeader.startsWith('Bearer ')) {
    return next(new ErrorResponse('Unauthorized: Authorization header must start with Bearer', 401));
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new ErrorResponse('Unauthorized: Missing token', 401));
  }
  try {
    const jwtConfig = await getCachedJwtConfig();
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || [],
    };
    next();
  } catch (err) {
    return next(new ErrorResponse('Unauthorized: Invalid or expired token', 401));
  }
};

/**
 * Middleware to require specific roles
 * Usage: requireRoles(['admin', 'manager'])
 */
export const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Unauthorized: Authentication required', 401));
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return next(
        new ErrorResponse(`Forbidden: Required roles: ${roles.join(' or ')}. User has: ${userRoles.join(', ')}`, 403)
      );
    }

    next();
  };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (req, res, next) => {
  return requireRoles('admin')(req, res, next);
};

/**
 * Middleware to require superadmin role
 */
export const requireSuperAdmin = (req, res, next) => {
  return requireRoles('superadmin')(req, res, next);
};

/**
 * Optional authentication - attaches user if token present but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const jwtConfig = await getCachedJwtConfig();
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || [],
    };
  } catch (err) {
    req.user = null;
  }

  next();
};
