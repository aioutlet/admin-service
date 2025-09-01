/**
 * Health Check Utilities for Admin Service
 * Provides standardized health checks for database and external services
 */

import mongoose from 'mongoose';
import config from '../config/index.js';
import logger from '../observability/index.js';

/**
 * Check MongoDB database connectivity
 */
export const checkDatabaseHealth = async () => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return {
        status: 'unhealthy',
        message: 'MongoDB not connected',
        details: {
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          database: mongoose.connection.name,
        },
      };
    }

    // Perform a simple ping operation
    const adminDb = mongoose.connection.db.admin();
    const pingResult = await adminDb.ping();

    if (pingResult.ok !== 1) {
      return {
        status: 'unhealthy',
        message: 'MongoDB ping failed',
        details: pingResult,
      };
    }

    return {
      status: 'healthy',
      message: 'MongoDB connection is healthy',
      details: {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        database: mongoose.connection.name,
        serverVersion: (await adminDb.serverInfo()).version,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `MongoDB health check failed: ${error.message}`,
      details: {
        error: error.message,
        readyState: mongoose.connection.readyState,
      },
    };
  }
};

/**
 * Check external service connectivity
 */
export const checkExternalServiceHealth = async (serviceName, serviceUrl, timeout = 5000) => {
  const startTime = Date.now();

  try {
    if (!serviceUrl) {
      return {
        status: 'skipped',
        message: `${serviceName} URL not configured`,
        responseTime: 0,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${serviceUrl}/health`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'admin-service-health-check/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const responseBody = await response.json().catch(() => ({}));
      return {
        status: 'healthy',
        message: `${serviceName} is healthy`,
        responseTime,
        details: {
          statusCode: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseBody,
        },
      };
    } else {
      return {
        status: 'unhealthy',
        message: `${serviceName} returned ${response.status}`,
        responseTime,
        details: {
          statusCode: response.status,
          statusText: response.statusText,
        },
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (error.name === 'AbortError') {
      return {
        status: 'unhealthy',
        message: `${serviceName} health check timed out after ${timeout}ms`,
        responseTime,
        details: {
          error: 'timeout',
        },
      };
    }

    return {
      status: 'unhealthy',
      message: `${serviceName} health check failed: ${error.message}`,
      responseTime,
      details: {
        error: error.message,
        code: error.code,
      },
    };
  }
};

/**
 * Perform comprehensive readiness check for admin service
 */
export const performReadinessCheck = async () => {
  const checks = {};
  let overallHealthy = true;
  const checkStartTime = Date.now();

  try {
    // Check database connectivity
    logger.debug('Performing database health check');
    checks.database = await checkDatabaseHealth();
    if (checks.database.status !== 'healthy') {
      overallHealthy = false;
    }

    // Check external services that admin service depends on
    const externalServices = [
      { name: 'user', url: config.services.user },
      { name: 'product', url: config.services.product },
      { name: 'order', url: config.services.order },
      { name: 'payment', url: config.services.payment },
      { name: 'audit', url: config.services.audit },
      { name: 'notification', url: config.services.notification },
    ];

    for (const service of externalServices) {
      // Skip localhost services in development
      const isLocalDev = service.url && service.url.includes('localhost');

      if (service.url && !isLocalDev) {
        logger.debug(`Performing ${service.name} service health check`);
        checks[service.name] = await checkExternalServiceHealth(service.name, service.url, 3000);

        // For readiness, critical services must be healthy
        const criticalServices = ['user', 'product', 'order'];
        if (
          criticalServices.includes(service.name) &&
          checks[service.name].status !== 'healthy' &&
          checks[service.name].status !== 'skipped'
        ) {
          overallHealthy = false;
        }
      } else {
        checks[service.name] = {
          status: 'skipped',
          message: `${service.name} service check skipped (development/default URL)`,
          responseTime: 0,
        };
      }
    }

    const totalCheckTime = Date.now() - checkStartTime;

    return {
      status: overallHealthy ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      totalCheckTime,
      checks,
    };
  } catch (error) {
    logger.error('Admin service readiness check failed', { error: error.message });

    return {
      status: 'not ready',
      timestamp: new Date().toISOString(),
      totalCheckTime: Date.now() - checkStartTime,
      error: error.message,
      checks,
    };
  }
};

/**
 * Perform liveness check (should be fast and not check external dependencies)
 */
export const performLivenessCheck = async () => {
  try {
    const memoryUsage = process.memoryUsage();

    // Check memory usage - if heap used is > 90% of total, consider unhealthy
    const memoryHealthy = memoryUsage.heapUsed < memoryUsage.heapTotal * 0.9;

    // Check if the main event loop is not blocked (basic responsiveness check)
    const startTime = process.hrtime.bigint();
    await new Promise((resolve) => setImmediate(resolve));
    const eventLoopDelay = Number(process.hrtime.bigint() - startTime) / 1000000; // Convert to milliseconds

    const eventLoopHealthy = eventLoopDelay < 100; // Less than 100ms delay is healthy

    const isHealthy = memoryHealthy && eventLoopHealthy;

    return {
      status: isHealthy ? 'alive' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        memory: {
          healthy: memoryHealthy,
          usage: memoryUsage,
          percentUsed: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
        },
        eventLoop: {
          healthy: eventLoopHealthy,
          delay: eventLoopDelay,
        },
        process: {
          pid: process.pid,
          nodeVersion: process.version,
          platform: process.platform,
        },
        adminService: {
          sessionTimeout: config.admin.sessionTimeout,
          maxLoginAttempts: config.admin.maxLoginAttempts,
          lockoutDuration: config.admin.lockoutDuration,
        },
      },
    };
  } catch (error) {
    logger.error('Admin service liveness check failed', { error: error.message });

    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
};

/**
 * Get system metrics for admin service monitoring
 */
export const getSystemMetrics = () => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  return {
    timestamp: new Date().toISOString(),
    service: 'admin-service',
    uptime: process.uptime(),
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers,
      percentUsed: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    },
    process: {
      pid: process.pid,
      ppid: process.ppid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      versions: process.versions,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      version: process.env.API_VERSION || '1.0.0',
    },
    admin: {
      port: config.server.port,
      sessionTimeout: config.admin.sessionTimeout,
      maxLoginAttempts: config.admin.maxLoginAttempts,
      lockoutDuration: config.admin.lockoutDuration,
    },
  };
};
