import express from 'express';

import adminRoutes from './routes/admin.routes.js';
import homeRoutes from './routes/home.routes.js';
import logger from './utils/logger.js';

const app = express();
app.use(express.json());

// Mount routes
app.use('/api/home', homeRoutes);
app.use('/api/admin', adminRoutes);

// Error handler (simple version)
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => logger.info(`Admin service running on port ${PORT}`));

export default app;
