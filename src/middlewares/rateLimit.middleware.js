import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import logger from '../observability/index.js';

// Helper function to get rate limit values from environment variables
const getRateLimitValue = (envVar, defaultValue) => {
  const value = parseInt(process.env[envVar], 10);
  return isNaN(value) ? defaultValue : value;
};

// Rate limiting configuration based on endpoint sensitivity for admin operations
const rateLimitConfig = {
  // User management operations (moderate)
  userManagement: {
    windowMs: getRateLimitValue('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
    max: getRateLimitValue('RATE_LIMIT_MAX_REQUESTS', 50), // 50 user management operations per window
    message: {
      error: 'Too many user management operations',
      message: 'Please try again later',
      retryAfter: getRateLimitValue('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded for user management operations', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        correlationId: req.correlationId,
        userId: req.user?.id,
      });
      res.status(429).json({
        error: 'Too many user management operations',
        message: 'Please try again later',
        retryAfter: getRateLimitValue('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
      });
    },
  },

  // Product management operations (moderate)
  productManagement: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // 100 product operations per window
    message: {
      error: 'Too many product management operations',
      message: 'Please try again later',
      retryAfter: 10 * 60 * 1000,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded for product management', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        correlationId: req.correlationId,
        userId: req.user?.id,
      });
      res.status(429).json({
        error: 'Too many product management operations',
        message: 'Please try again later',
        retryAfter: 10 * 60 * 1000,
      });
    },
  },

  // Order management operations (moderate)
  orderManagement: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 order operations per window
    message: {
      error: 'Too many order management operations',
      message: 'Please try again later',
      retryAfter: 15 * 60 * 1000,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded for order management', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        correlationId: req.correlationId,
        userId: req.user?.id,
      });
      res.status(429).json({
        error: 'Too many order management operations',
        message: 'Please try again later',
        retryAfter: 15 * 60 * 1000,
      });
    },
  },

  // System configuration operations (strict)
  systemConfig: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 system config changes per hour
    message: {
      error: 'Too many system configuration operations',
      message: 'Please try again later',
      retryAfter: 60 * 60 * 1000,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded for system configuration', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        correlationId: req.correlationId,
        userId: req.user?.id,
      });
      res.status(429).json({
        error: 'Too many system configuration operations',
        message: 'Please try again later',
        retryAfter: 60 * 60 * 1000,
      });
    },
  },

  // Analytics and reporting operations (lenient)
  analytics: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // 50 analytics requests per window
    message: {
      error: 'Too many analytics requests',
      message: 'Please try again later',
      retryAfter: 10 * 60 * 1000,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded for analytics operations', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        correlationId: req.correlationId,
        userId: req.user?.id,
      });
      res.status(429).json({
        error: 'Too many analytics requests',
        message: 'Please try again later',
        retryAfter: 10 * 60 * 1000,
      });
    },
  },

  // Audit log access operations (moderate)
  auditLogs: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 audit log requests per window
    message: {
      error: 'Too many audit log requests',
      message: 'Please try again later',
      retryAfter: 15 * 60 * 1000,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded for audit log access', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        correlationId: req.correlationId,
        userId: req.user?.id,
      });
      res.status(429).json({
        error: 'Too many audit log requests',
        message: 'Please try again later',
        retryAfter: 15 * 60 * 1000,
      });
    },
  },

  // Admin authentication operations (strict)
  adminAuth: {
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 5, // 5 authentication attempts per window
    message: {
      error: 'Too many authentication attempts',
      message: 'Please try again later',
      retryAfter: 30 * 60 * 1000,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded for admin authentication', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        correlationId: req.correlationId,
      });
      res.status(429).json({
        error: 'Too many authentication attempts',
        message: 'Please try again later',
        retryAfter: 30 * 60 * 1000,
      });
    },
  },

  // General admin API endpoints (moderate)
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests per window
    message: {
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: 15 * 60 * 1000,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded for general admin API', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        correlationId: req.correlationId,
        userId: req.user?.id,
      });
      res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: 15 * 60 * 1000,
      });
    },
  },
};

// Progressive delay for sensitive admin operations
const sensitiveOperationsSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 3, // Start delaying after 3 attempts for admin operations
  delayMs: (used) => Math.min(used * 500, 15000), // Progressive delay: 500ms per attempt, max 15s
  skipFailedRequests: false,
  skipSuccessfulRequests: true, // Don't delay successful requests
  skip: (req, _res) => {
    // Skip health check endpoints
    return req.path === '/health' || req.path === '/api/health';
  },
  validate: {
    delayMs: false, // Disable warning about delayMs
  },
});

// Create rate limiters for admin operations
export const userManagementRateLimit = rateLimit(rateLimitConfig.userManagement);
export const productManagementRateLimit = rateLimit(rateLimitConfig.productManagement);
export const orderManagementRateLimit = rateLimit(rateLimitConfig.orderManagement);
export const systemConfigRateLimit = rateLimit(rateLimitConfig.systemConfig);
export const analyticsRateLimit = rateLimit(rateLimitConfig.analytics);
export const auditLogsRateLimit = rateLimit(rateLimitConfig.auditLogs);
export const adminAuthRateLimit = rateLimit(rateLimitConfig.adminAuth);
export const generalRateLimit = rateLimit(rateLimitConfig.general);

// Utility function to skip rate limiting for health checks and monitoring
export const skipHealthChecks = (req) => {
  return req.path.startsWith('/health') || req.path.startsWith('/metrics');
};

// Apply skipHealthChecks to all rate limiters
[
  userManagementRateLimit,
  productManagementRateLimit,
  orderManagementRateLimit,
  systemConfigRateLimit,
  analyticsRateLimit,
  auditLogsRateLimit,
  adminAuthRateLimit,
  generalRateLimit,
].forEach((limiter) => {
  limiter.skip = skipHealthChecks;
});

export default {
  userManagementRateLimit,
  productManagementRateLimit,
  orderManagementRateLimit,
  systemConfigRateLimit,
  analyticsRateLimit,
  auditLogsRateLimit,
  adminAuthRateLimit,
  generalRateLimit,
  sensitiveOperationsSlowDown,
};
