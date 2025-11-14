import { getAllUsers, getUserById, updateUser, deleteUser } from '../../src/controllers/admin.controller.js';
import * as userService from '../../src/services/user.service.client.js';
import adminValidator from '../../src/validators/admin.validator.js';

// Mock dependencies
jest.mock('../../src/services/user.service.client.js');
jest.mock('../../src/core/logger.js', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('admin.controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      headers: {
        authorization: 'Bearer test_token',
      },
      user: {
        _id: 'admin123',
        id: 'admin123',
        email: 'admin@test.com',
        roles: ['admin'],
      },
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com' },
        { id: '2', email: 'user2@test.com' },
      ];
      userService.fetchAllUsers.mockResolvedValue(mockUsers);

      await getAllUsers(req, res, next);

      expect(userService.fetchAllUsers).toHaveBeenCalledWith('test_token');
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should return user when valid ID is provided', async () => {
      req.params.id = '507f1f77bcf86cd799439011';
      const mockUser = { id: req.params.id, email: 'user@test.com' };
      userService.fetchUserById.mockResolvedValue(mockUser);

      await getUserById(req, res, next);

      expect(userService.fetchUserById).toHaveBeenCalledWith(req.params.id, 'test_token');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 400 for invalid user ID', async () => {
      req.params.id = 'invalid_id';

      await getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
      expect(userService.fetchUserById).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    beforeEach(() => {
      req.params.id = '507f1f77bcf86cd799439011';
    });

    it('should update user with valid data', async () => {
      req.body = { firstName: 'John', lastName: 'Doe' };
      const mockUpdatedUser = { id: req.params.id, ...req.body };
      userService.updateUserById.mockResolvedValue(mockUpdatedUser);

      await updateUser(req, res, next);

      expect(userService.updateUserById).toHaveBeenCalledWith(req.params.id, req.body, 'test_token');
      expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it('should return 400 for invalid user ID', async () => {
      req.params.id = 'invalid_id';
      req.body = { firstName: 'John' };

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
      expect(userService.updateUserById).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid payload', async () => {
      req.body = { invalidField: 'value' };

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid update payload' });
      expect(userService.updateUserById).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid roles', async () => {
      req.body = { roles: ['invalid_role'] };

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid roles' });
      expect(userService.updateUserById).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid isActive value', async () => {
      req.body = { isActive: 'true' };

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid isActive value' });
      expect(userService.updateUserById).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email', async () => {
      req.body = { email: 'invalid_email' };

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email' });
      expect(userService.updateUserById).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid password', async () => {
      req.body = { password: 'short' };

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid password' });
      expect(userService.updateUserById).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      req.params.id = '507f1f77bcf86cd799439011';
    });

    it('should delete user successfully', async () => {
      userService.removeUserById.mockResolvedValue();

      await deleteUser(req, res, next);

      expect(userService.removeUserById).toHaveBeenCalledWith(req.params.id, 'test_token');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 400 for invalid user ID', async () => {
      req.params.id = 'invalid_id';

      await deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
      expect(userService.removeUserById).not.toHaveBeenCalled();
    });

    it('should return 403 when admin tries to delete themselves', async () => {
      req.params.id = 'admin123';
      // The ID needs to be a valid ObjectId format
      req.params.id = '507f1f77bcf86cd799439011';
      req.user.id = '507f1f77bcf86cd799439011';

      await deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Admins cannot delete their own account.' });
      expect(userService.removeUserById).not.toHaveBeenCalled();
    });
  });
});
