import express from 'express';
import adminRoutes from './routes/admin.routes.js';

const app = express();
app.use(express.json());

// Mount admin routes
app.use('/admin', adminRoutes);

// Error handler (simple version)
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Admin service running on port ${PORT}`));

export default app;
