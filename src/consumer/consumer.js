/**
 * Admin Service Consumer
 * Consumes and processes events from message broker
 */

import '../shared/observability/tracing/setup.js'; // Initialize tracing first
import logger from '../shared/observability/logging/index.js';
import eventHandlers from './handlers/index.js';

let isShuttingDown = false;

/**
 * Initialize and start the consumer
 */
async function startConsumer() {
  try {
    logger.info('🚀 Starting Admin Service Consumer...', null, {
      metadata: {
        environment: process.env.NODE_ENV || 'development',
        serviceType: 'consumer',
        nodeVersion: process.version,
        processId: process.pid,
      },
    });

    // TODO: Initialize message broker when implemented
    logger.info('📍 Service: admin-service v1.0.0');
    logger.info('🌍 Environment: ' + (process.env.NODE_ENV || 'development'));

    // Register event handlers
    Object.keys(eventHandlers).forEach((eventType) => {
      logger.info(`✓ Registered handler for: ${eventType}`);
    });

    logger.info('👂 Consumer ready (message broker not yet implemented)');
    logger.info('🎯 Admin consumer will process: fraud.detected, order.high_value, support.escalated');

    // Keep the process running
    await new Promise(() => {});
  } catch (error) {
    logger.error('❌ Failed to start consumer', null, { error });
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    logger.warn('💀 Force shutdown - received second signal');
    process.exit(1);
  }

  isShuttingDown = true;
  logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);

  try {
    logger.info('✅ Graceful shutdown completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during graceful shutdown', null, { error });
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception in Consumer', null, { error });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection in Consumer', null, {
    error: reason,
    metadata: { promise: String(promise) },
  });
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the consumer
startConsumer();
