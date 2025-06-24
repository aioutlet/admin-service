import logger from '../utils/logger.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { fetchAllUsers, fetchUserById, updateUserById, removeUserById } from '../services/userServiceClient.js';
import adminValidator from '../validators/admin.validator.js';

/**
 * @desc    Get all users
 * @route   GET /admin/users
 * @access  Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  logger.info('Admin requested all users', { actorId: req.user?._id });
  const users = await fetchAllUsers(req.headers.authorization?.split(' ')[1]);
  res.json(users);
});

/**
 * @desc    Get user by ID
 * @route   GET /admin/users/:id
 * @access  Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  if (!adminValidator.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  logger.info('Admin requested user by id', { actorId: req.user?._id, targetId: req.params.id });
  const user = await fetchUserById(req.params.id, req.headers.authorization?.split(' ')[1]);
  res.json(user);
});

/**
 * @desc    Update user by ID (profile, password, activate/deactivate)
 * @route   PATCH /admin/users/:id
 * @access  Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  if (!adminValidator.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  if (!adminValidator.isValidUpdatePayload(req.body)) {
    return res.status(400).json({ error: 'Invalid update payload' });
  }
  if ('roles' in req.body && !adminValidator.isValidRoles(req.body.roles)) {
    return res.status(400).json({ error: 'Invalid roles' });
  }
  if ('isActive' in req.body && !adminValidator.isValidIsActive(req.body.isActive)) {
    return res.status(400).json({ error: 'Invalid isActive value' });
  }
  if ('email' in req.body && !adminValidator.isValidEmail(req.body.email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if ('password' in req.body && !adminValidator.isValidPassword(req.body.password)) {
    return res.status(400).json({ error: 'Invalid password' });
  }
  logger.info('Admin updating user', { actorId: req.user?.id, targetId: req.params.id });
  // Send all updatable fields (profile, password, isActive, etc.)
  const updated = await updateUserById(req.params.id, req.body, req.headers.authorization?.split(' ')[1]);
  res.json(updated);
});

/**
 * @desc    Delete user by ID
 * @route   DELETE /admin/users/:id
 * @access  Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  if (!adminValidator.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  // Prevent admin from deleting himself
  if (req.user && req.user.id && req.user.id.toString() === req.params.id) {
    logger.warn('Admin attempted to delete himself', { actorId: req.user.id });
    return res.status(403).json({ error: 'Admins cannot delete their own account.' });
  }
  logger.info('Admin deleting user', { actorId: req.user?.id, targetId: req.params.id });
  await removeUserById(req.params.id, req.headers.authorization?.split(' ')[1]);
  res.status(204).send();
});
