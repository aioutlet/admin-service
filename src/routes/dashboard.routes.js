import express from 'express';
import {
  getDashboardStats,
  getRecentOrders,
  getRecentUsers,
  getAnalytics,
} from '../controllers/dashboard.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All dashboard routes require authentication and admin role
router.use(authenticateJWT, requireRoles('admin'));

router.get('/stats', getDashboardStats);
router.get('/recent-orders', getRecentOrders);
router.get('/recent-users', getRecentUsers);
router.get('/analytics', getAnalytics);

export default router;
