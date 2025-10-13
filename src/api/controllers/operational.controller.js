/**
 * Operational/Infrastructure endpoints for Admin Service
 * These endpoints are used by monitoring systems, load balancers, and DevOps tools
 */

import logger from '../../shared/observability/index.js';
import {
  performReadinessCheck,
  performLivenessCheck,
  getSystemMetrics,
} from '../../shared/observability/monitoring/health.checks.js';

/**
 * Main health check endpoint
 * Simple health status for basic monitoring
 */
export async function health(req, res) {
  try {
    logger.debug('Health check requested', {
      correlationId: req.correlationId,
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
      correlationId: req.correlationId,
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
      correlationId: req.correlationId,
      ip: req.ip,
    });

    const readinessResult = await performReadinessCheck();

    const statusCode = readinessResult.status === 'ready' ? 200 : 503;

    logger.info('Readiness check completed', {
      status: readinessResult.status,
      totalCheckTime: readinessResult.totalCheckTime,
      correlationId: req.correlationId,
    });

    res.status(statusCode).json({
      service: 'admin-service',
      ...readinessResult,
    });
  } catch (error) {
    logger.error('Readiness check failed', {
      error: error.message,
      stack: error.stack,
      correlationId: req.correlationId,
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
      correlationId: req.correlationId,
      ip: req.ip,
    });

    const livenessResult = await performLivenessCheck();

    const statusCode = livenessResult.status === 'alive' ? 200 : 503;

    if (livenessResult.status !== 'alive') {
      logger.warn('Liveness check indicates unhealthy state', {
        status: livenessResult.status,
        checks: livenessResult.checks,
        correlationId: req.correlationId,
      });
    }

    res.status(statusCode).json({
      service: 'admin-service',
      ...livenessResult,
    });
  } catch (error) {
    logger.error('Liveness check failed', {
      error: error.message,
      stack: error.stack,
      correlationId: req.correlationId,
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
      correlationId: req.correlationId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    const metrics = getSystemMetrics();

    // Log business metric: metrics access
    logger.business('Metrics endpoint accessed', {
      endpoint: '/metrics',
      correlationId: req.correlationId,
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
      correlationId: req.correlationId,
    });

    res.status(500).json({
      service: 'admin-service',
      timestamp: new Date().toISOString(),
      error: 'Failed to retrieve metrics',
      details: error.message,
    });
  }
}
