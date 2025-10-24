/**
 * Dependency Health Checker for Admin Service
 * Checks health of external service dependencies without blocking startup
 */

/**
 * Check health of service dependencies without blocking startup
 * @param {Object} dependencies - Object with service names as keys and health URLs as values
 * @param {number} timeout - Timeout for each health check in ms
 * @returns {Promise<Array>} - Array of health check results
 */
export async function checkDependencyHealth(dependencies, timeout = 5000) {
  console.log('[DEPS] 🔍 Checking dependency health...');

  // Add external service health checks
  const serviceChecks = Object.entries(dependencies).map(async ([serviceName, healthUrl]) => {
    try {
      console.log(`[DEPS] Checking ${serviceName} health at ${healthUrl}`);

      // Create fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(healthUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        method: 'GET',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`[DEPS] ✅ ${serviceName} is healthy`);
        return { service: serviceName, status: 'healthy', url: healthUrl };
      } else {
        console.error(`[DEPS] ⚠️ ${serviceName} returned status ${response.status}`);
        return { service: serviceName, status: 'unhealthy', url: healthUrl, statusCode: response.status };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`[DEPS] ⏰ ${serviceName} health check timed out after ${timeout}ms`);
        return { service: serviceName, status: 'timeout', error: 'timeout' };
      } else {
        console.error(`[DEPS] ❌ ${serviceName} is not reachable: ${error.message}`);
        return { service: serviceName, status: 'unreachable', error: error.message };
      }
    }
  });

  const results = await Promise.allSettled(serviceChecks);

  // Summary logging
  const healthyServices = results.filter((r) => r.status === 'fulfilled' && r.value.status === 'healthy').length;
  const totalServices = results.length;

  if (healthyServices === totalServices) {
    console.log(`[DEPS] 🎉 All ${totalServices} dependencies are healthy`);
  } else {
    console.error(`[DEPS] ⚠️ ${healthyServices}/${totalServices} dependencies are healthy`);
  }

  return results.map((r) => (r.status === 'fulfilled' ? r.value : { error: r.reason }));
}

/**
 * Get dependency URLs from environment variables
 * Uses standardized _HEALTH_URL variables for complete health endpoint URLs
 * @returns {Object} - Object with service names as keys and health URLs as values
 */
export function getDependencies() {
  const dependencies = {};

  // Add user-service if configured (primary dependency for admin operations)
  if (process.env.USER_SERVICE_HEALTH_URL) {
    dependencies['user-service'] = process.env.USER_SERVICE_HEALTH_URL;
  }

  // Add message broker if configured (for publishing admin events)
  if (process.env.MESSAGE_BROKER_SERVICE_HEALTH_URL) {
    dependencies['message-broker'] = process.env.MESSAGE_BROKER_SERVICE_HEALTH_URL;
  }

  return dependencies;
}
