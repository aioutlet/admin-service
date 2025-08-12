import express from 'express';

import adminRoutes from './routes/admin.routes.js';
import homeRoutes from './routes/home.routes.js';
import logger from './utils/logger.js';
import correlationIdMiddleware from './middlewares/correlationId.middleware.js';
import { health, readiness, liveness, metrics } from './controllers/operational.controller.js';

const app = express();
app.use(correlationIdMiddleware); // Add correlation ID middleware first
app.use(express.json());

// Mount routes
app.use('/api/home', homeRoutes);
app.use('/api/admin', adminRoutes);

// Operational endpoints (for monitoring, load balancers, K8s probes)
app.get('/health', health); // Main health check
app.get('/health/ready', readiness); // Readiness probe
app.get('/health/live', liveness); // Liveness probe
app.get('/metrics', metrics); // Basic metrics

// Error handler (simple version)
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => logger.info(`Admin service running on port ${PORT}`));

export default app;
