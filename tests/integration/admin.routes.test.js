/**
 * Integration tests for admin routes
 * These tests use a minimal Express app with just the admin routes to test
 * the integration between routes, middleware, and controllers
 */
import express from 'express';
import jwt from 'jsonwebtoken';
import adminRoutes from '../../src/routes/admin.routes.js';
import * as userService from '../../src/services/user.service.client.js';

// Mock dependencies
jest.mock('../../src/services/user.service.client.js');
jest.mock('../../src/core/logger.js', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock JWT
jest.mock('jsonwebtoken');

describe('Admin Routes Integration', () => {
  let app;
  let validToken;
  let adminPayload;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret';
  });

  beforeEach(() => {
    // Create minimal Express app for testing
    app = express();
    app.use(express.json());
    app.use('/api/admin', adminRoutes);

    // Add error handler
    app.use((err, req, res, next) => {
      res.status(err.statusCode || 500).json({
        error: err.message || 'Internal server error',
      });
    });

    // Setup test token
    validToken = 'valid_test_token';
    adminPayload = {
      id: 'admin123',
      email: 'admin@test.com',
      roles: ['admin'],
    };

    // Mock JWT verification
    jwt.verify.mockImplementation((token, secret) => {
      if (token === validToken) {
        return adminPayload;
      }
      throw new Error('Invalid token');
    });

    jest.clearAllMocks();
  });

  describe('GET /api/admin/users', () => {
    it('should return all users with valid admin token', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com' },
        { id: '2', email: 'user2@test.com' },
      ];
      userService.fetchAllUsers.mockResolvedValue(mockUsers);

      const request = require('supertest');
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
    });

    it('should return 401 without authentication token', async () => {
      const request = require('supertest');
      const response = await request(app).get('/api/admin/users');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const request = require('supertest');
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });

    it('should return 403 without admin role', async () => {
      const userToken = 'user_token';
      jwt.verify.mockImplementation((token) => {
        if (token === userToken) {
          return {
            id: 'user123',
            email: 'user@test.com',
            roles: ['user'],
          };
        }
        throw new Error('Invalid token');
      });

      const request = require('supertest');
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should return user with valid ID', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = { id: userId, email: 'user@test.com' };
      userService.fetchUserById.mockResolvedValue(mockUser);

      const request = require('supertest');
      const response = await request(app)
        .get(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it('should return 400 with invalid ID format', async () => {
      const request = require('supertest');
      const response = await request(app)
        .get('/api/admin/users/invalid_id')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid user ID');
    });
  });

  describe('PATCH /api/admin/users/:id', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('should update user with valid data', async () => {
      const updates = { firstName: 'John', lastName: 'Doe' };
      const mockUpdatedUser = { id: userId, ...updates };
      userService.updateUserById.mockResolvedValue(mockUpdatedUser);

      const request = require('supertest');
      const response = await request(app)
        .patch(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedUser);
    });

    it('should return 400 with invalid payload', async () => {
      const request = require('supertest');
      const response = await request(app)
        .patch(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ invalidField: 'value' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid update payload');
    });

    it('should return 400 with invalid email', async () => {
      const request = require('supertest');
      const response = await request(app)
        .patch(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ email: 'invalid_email' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid email');
    });

    it('should return 400 with weak password', async () => {
      const request = require('supertest');
      const response = await request(app)
        .patch(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ password: 'weak' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid password');
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete user successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      userService.removeUserById.mockResolvedValue();

      const request = require('supertest');
      const response = await request(app)
        .delete(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 400 with invalid ID format', async () => {
      const request = require('supertest');
      const response = await request(app)
        .delete('/api/admin/users/invalid_id')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid user ID');
    });

    it('should return 403 when admin tries to delete themselves', async () => {
      // Use a valid ObjectId that matches the admin's ID
      const adminId = '507f1f77bcf86cd799439011';
      adminPayload.id = adminId;
      jwt.verify.mockReturnValue(adminPayload);

      const request = require('supertest');
      const response = await request(app)
        .delete(`/api/admin/users/${adminId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('cannot delete their own account');
    });
  });
});
