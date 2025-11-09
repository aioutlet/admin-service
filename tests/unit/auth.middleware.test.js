import jwt from 'jsonwebtoken';
import { authenticateJWT, requireRoles, requireAdmin, optionalAuth } from '../../src/middlewares/auth.middleware.js';
import ErrorResponse from '../../src/utils/error.response.js';

// Mock JWT
jest.mock('jsonwebtoken');

describe('auth.middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
    process.env.JWT_SECRET = 'test_secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateJWT', () => {
    it('should call next with error when no authorization header', () => {
      authenticateJWT(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ErrorResponse));
      expect(next.mock.calls[0][0].message).toContain('Missing Authorization header');
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should call next with error when authorization header does not start with Bearer', () => {
      req.headers.authorization = 'Basic token123';

      authenticateJWT(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ErrorResponse));
      expect(next.mock.calls[0][0].message).toContain('must start with Bearer');
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should call next with error when token is missing', () => {
      req.headers.authorization = 'Bearer ';

      authenticateJWT(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ErrorResponse));
      expect(next.mock.calls[0][0].message).toContain('Missing token');
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should call next with error when token is invalid', () => {
      req.headers.authorization = 'Bearer invalid_token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticateJWT(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ErrorResponse));
      expect(next.mock.calls[0][0].message).toContain('Invalid or expired token');
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should attach user to request and call next when token is valid', () => {
      const decoded = {
        id: 'user123',
        email: 'test@example.com',
        roles: ['admin'],
      };
      req.headers.authorization = 'Bearer valid_token';
      jwt.verify.mockReturnValue(decoded);

      authenticateJWT(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'test_secret');
      expect(req.user).toEqual(decoded);
      expect(next).toHaveBeenCalledWith();
    });

    it('should handle missing roles in token', () => {
      const decoded = {
        id: 'user123',
        email: 'test@example.com',
      };
      req.headers.authorization = 'Bearer valid_token';
      jwt.verify.mockReturnValue(decoded);

      authenticateJWT(req, res, next);

      expect(req.user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        roles: [],
      });
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('requireRoles', () => {
    it('should call next with error when user is not authenticated', () => {
      const middleware = requireRoles('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ErrorResponse));
      expect(next.mock.calls[0][0].message).toContain('Authentication required');
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should call next with error when user does not have required role', () => {
      req.user = {
        id: 'user123',
        email: 'test@example.com',
        roles: ['user'],
      };
      const middleware = requireRoles('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ErrorResponse));
      expect(next.mock.calls[0][0].message).toContain('Required roles: admin');
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });

    it('should call next when user has required role', () => {
      req.user = {
        id: 'user123',
        email: 'test@example.com',
        roles: ['admin'],
      };
      const middleware = requireRoles('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should call next when user has one of multiple required roles', () => {
      req.user = {
        id: 'user123',
        email: 'test@example.com',
        roles: ['manager'],
      };
      const middleware = requireRoles('admin', 'manager');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should handle empty roles array', () => {
      req.user = {
        id: 'user123',
        email: 'test@example.com',
        roles: [],
      };
      const middleware = requireRoles('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ErrorResponse));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });

  describe('requireAdmin', () => {
    it('should require admin role', () => {
      req.user = {
        id: 'user123',
        email: 'test@example.com',
        roles: ['admin'],
      };

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should reject non-admin user', () => {
      req.user = {
        id: 'user123',
        email: 'test@example.com',
        roles: ['user'],
      };

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ErrorResponse));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });
  });

  describe('optionalAuth', () => {
    it('should set user to null when no authorization header', () => {
      optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalledWith();
    });

    it('should set user to null when authorization header does not start with Bearer', () => {
      req.headers.authorization = 'Basic token123';

      optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalledWith();
    });

    it('should set user to null when token is missing', () => {
      req.headers.authorization = 'Bearer ';

      optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalledWith();
    });

    it('should set user to null when token is invalid', () => {
      req.headers.authorization = 'Bearer invalid_token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalledWith();
    });

    it('should attach user to request when token is valid', () => {
      const decoded = {
        id: 'user123',
        email: 'test@example.com',
        roles: ['admin'],
      };
      req.headers.authorization = 'Bearer valid_token';
      jwt.verify.mockReturnValue(decoded);

      optionalAuth(req, res, next);

      expect(req.user).toEqual(decoded);
      expect(next).toHaveBeenCalledWith();
    });
  });
});
