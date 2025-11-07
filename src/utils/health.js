/**
 * Simple health check utilities
 */

/**
 * Perform readiness check
 */
export const performReadinessCheck = async () => {
  return {
    status: 'ready',
    checks: {
      service: 'healthy',
    },
  };
};

/**
 * Perform liveness check
 */
export const performLivenessCheck = async () => {
  return {
    status: 'alive',
    checks: {
      service: 'healthy',
    },
  };
};

/**
 * Get system metrics
 */
export const getSystemMetrics = () => {
  const memUsage = process.memoryUsage();

  return {
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
};
