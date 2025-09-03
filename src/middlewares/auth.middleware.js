import jwt from 'jsonwebtoken';
import ErrorResponse from '../utils/error.response.js';

/**
 * Middleware for JWT authentication in the admin service.
 * Verifies the Authorization header, decodes the JWT, and attaches the user payload to req.user.
 * Responds with 401 Unauthorized if the token is missing or invalid.
 */
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new ErrorResponse('Unauthorized: Missing Authorization header', 401));
  }
  if (!authHeader.startsWith('Bearer ')) {
    return next(new ErrorResponse('Unauthorized: Authorization header must start with Bearer', 401));
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new ErrorResponse('Unauthorized: Missing token', 401));
  }
  try {
    // Replace 'your_jwt_secret' with your actual secret or public key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ErrorResponse('Unauthorized: Invalid or expired token', 401));
  }
};
