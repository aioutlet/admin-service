import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/admin.controller.js';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateJWT, requireRole('admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
