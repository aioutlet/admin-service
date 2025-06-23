import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserPassword,
  activateUserAccount,
  deactivateUserAccount,
  deleteUser,
} from '../controllers/admin.controller.js';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateJWT, requireRole('admin'));

// Prefix all admin routes with /admin
router.get('/admin/users', getAllUsers);
router.get('/admin/users/:id', getUserById);
router.patch('/admin/users/:id', updateUser);
router.post('/admin/users/:id/password/change', updateUserPassword);
router.post('/admin/users/:id/activate', activateUserAccount);
router.post('/admin/users/:id/deactivate', deactivateUserAccount);
router.delete('/admin/users/:id', deleteUser);

export default router;
