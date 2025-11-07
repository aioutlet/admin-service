import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import validateConfig from './validators/config.validator.js';
import config from './core/config.js';
import logger from './core/logger.js';
import adminRoutes from './routes/admin.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import homeRoutes from './routes/home.routes.js';
import correlationIdMiddleware from './middlewares/correlationId.middleware.js';
import { health, readiness, liveness, metrics } from './controllers/operational.controller.js';

// Validate configuration before starting
validateConfig();
const app = express();

// Trust proxy for accurate IP address extraction
app.set('trust proxy', true);

// Apply CORS before other middlewares
app.use(
  cors({
    origin: config.security.corsOrigin,
    credentials: true,
  })
);

app.use(correlationIdMiddleware);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/home', homeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

// Operational endpoints
app.get('/health', health);
app.get('/health/ready', readiness);
app.get('/health/live', liveness);
app.get('/metrics', metrics);

// Centralized error handler
app.use((err, req, res, _next) => {
  const status = err.statusCode || err.status || 500;
  const correlationId = req.correlationId || 'no-correlation';

  logger.error(`Request failed: ${req.method} ${req.originalUrl} - ${err.message || 'Unknown error'}`, {
    correlationId,
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
      traceId: req.traceId || null,
    },
  });
});

const PORT = config.server.port;
const HOST = config.server.host;

app.listen(PORT, HOST, () => {
  logger.info(`Admin service running on ${HOST}:${PORT} in ${config.env} mode`, {
    service: 'admin-service',
    version: '1.0.0',
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
