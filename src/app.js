import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import config from './config/index.js';
import adminRoutes from './routes/admin.routes.js';
import homeRoutes from './routes/home.routes.js';
import logger from './observability/index.js';
import correlationIdMiddleware from './middlewares/correlationId.middleware.js';
import rateLimitMiddleware from './middlewares/rateLimit.middleware.js';
import { health, readiness, liveness, metrics } from './controllers/operational.controller.js';

const { generalRateLimit } = rateLimitMiddleware;

const app = express();

// Apply CORS before other middlewares
app.use(
  cors({
    origin: config.security.corsOrigin,
    credentials: true,
  })
);

app.use(correlationIdMiddleware); // Add correlation ID middleware first

// Apply general rate limiting (will be skipped for health checks automatically)
if (config.security.enableRateLimiting) {
  app.use(generalRateLimit);
}

app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use('/api/home', homeRoutes);
app.use('/api/admin', adminRoutes);

// Operational endpoints (for monitoring, load balancers, K8s probes)
app.get('/health', health); // Main health check
app.get('/health/ready', readiness); // Readiness probe
app.get('/health/live', liveness); // Liveness probe
app.get('/metrics', metrics); // Basic metrics

// Centralized error handler for consistent error responses
app.use((err, req, res, _next) => {
  const status = err.status || 500;

  // Log error with observability context
  logger.error('Application error occurred', {
    error: err.message,
    stack: err.stack,
    status,
    path: req.path,
    method: req.method,
    correlationId: req.correlationId,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
      details: err.details || null,
      traceId: req.traceId || null,
    },
  });
});

app.listen(config.server.port, config.server.host, () => {
  logger.info(`Admin service starting up`);
  logger.info(`Server running on ${config.server.host}:${config.server.port}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`CORS origins: ${config.security.corsOrigin.join(', ')}`);
  logger.info(`Rate limiting: ${config.security.enableRateLimiting ? 'enabled' : 'disabled'}`);
  logger.info('Admin service is ready to accept connections');
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  logger.info('Admin service shutdown completed');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
