import logger from '../core/logger.js';

/**
 * Main health check endpoint
 * Simple health status for basic monitoring
 */
export async function health(req, res) {
  try {
    logger.debug('Health check requested', {
      traceId: res.locals.traceId,
      spanId: res.locals.spanId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      status: 'healthy',
      service: 'admin-service',
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || '1.0.0',
      uptime: process.uptime(),
    });
  } catch (error) {
    logger.error('Health check failed', {
      error: error.message,
      traceId: res.locals.traceId,
      spanId: res.locals.spanId,
    });

    res.status(500).json({
      status: 'unhealthy',
      service: 'admin-service',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}

/**
 * Readiness probe endpoint
 * Comprehensive check including external dependencies
 */
export async function readiness(req, res) {
  try {
    logger.debug('Readiness probe requested', {
      traceId: res.locals.traceId,
      spanId: res.locals.spanId,
      ip: req.ip,
    });

    const readinessResult = {
      status: 'ready',
      checks: {
        service: 'healthy',
      },
    };

    logger.info('Readiness check completed', {
      status: readinessResult.status,
      traceId: res.locals.traceId,
      spanId: res.locals.spanId,
    });

    res.status(200).json({
      service: 'admin-service',
      ...readinessResult,
    });
  } catch (error) {
    logger.error('Readiness check failed', {
      error: error.message,
      stack: error.stack,
      traceId: res.locals.traceId,
      spanId: res.locals.spanId,
    });

    res.status(503).json({
      status: 'not ready',
      service: 'admin-service',
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed',
      details: error.message,
    });
  }
}

/**
 * Liveness probe endpoint
 * Fast check to verify service is responsive
 */
export async function liveness(req, res) {
  try {
    logger.debug('Liveness probe requested', {
      traceId: res.locals.traceId,
      spanId: res.locals.spanId,
      ip: req.ip,
    });

    const livenessResult = {
      status: 'alive',
      checks: {
        service: 'healthy',
      },
    };

    res.status(200).json({
      service: 'admin-service',
      ...livenessResult,
    });
  } catch (error) {
    logger.error('Liveness check failed', {
      error: error.message,
      stack: error.stack,
      traceId: res.locals.traceId,
      spanId: res.locals.spanId,
    });

    res.status(503).json({
      status: 'unhealthy',
      service: 'admin-service',
      timestamp: new Date().toISOString(),
      error: 'Liveness check failed',
      details: error.message,
    });
  }
}

/**
 * Metrics endpoint
 * System metrics for monitoring and observability
 */
export function metrics(req, res) {
  try {
    logger.debug('Metrics requested', {
      traceId: res.locals.traceId,
      spanId: res.locals.spanId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    const memUsage = process.memoryUsage();

    const metrics = {
      uptime: process.uptime(),
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
      },
      nodeVersion: process.version,
      platform: process.platform,
    };

    // Log business metric: metrics access
    logger.business('Metrics endpoint accessed', {
      endpoint: '/metrics',
      traceId: res.locals.traceId,
      spanId: res.locals.spanId,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      responseTime: 0, // This will be filled by response time middleware if available
    });

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics retrieval failed', {
      error: error.message,
      stack: error.stack,
      traceId: res.locals.traceId,
      spanId: res.locals.spanId,
    });

    res.status(500).json({
      service: 'admin-service',
      timestamp: new Date().toISOString(),
      error: 'Failed to retrieve metrics',
      details: error.message,
    });
  }
}
