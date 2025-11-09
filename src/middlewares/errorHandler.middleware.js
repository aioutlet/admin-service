import logger from '../core/logger.js';

/**
 * Centralized error handler middleware
 * Logs errors with trace context and returns standardized error responses
 */
const errorHandler = (err, req, res, _next) => {
  const status = err.statusCode || err.status || 500;
  const traceId = res.locals.traceId || 'no-trace';
  const spanId = res.locals.spanId || 'no-span';

  logger.error(`Request failed: ${req.method} ${req.originalUrl} - ${err.message || 'Unknown error'}`, {
    traceId,
    spanId,
    method: req.method,
    url: req.originalUrl,
    status,
    errorCode: err.code || 'INTERNAL_ERROR',
    errorMessage: err.message,
    errorStack: err.stack,
    userId: req.user?.id,
  });

  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
      details: err.details || null,
      traceId: traceId,
    },
  });
};

export default errorHandler;
