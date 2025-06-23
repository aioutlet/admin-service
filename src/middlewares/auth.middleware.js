import jwt from 'jsonwebtoken';

/**
 * Middleware for JWT authentication in the admin service.
 * Verifies the Authorization header, decodes the JWT, and attaches the user payload to req.user.
 * Responds with 401 Unauthorized if the token is missing or invalid.
 */
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Missing Authorization header' });
  }
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Authorization header must start with Bearer' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  try {
    // Replace 'your_jwt_secret' with your actual secret or public key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token', details: err.message });
  }
};

/**
 * Middleware to require a specific user role (e.g., 'admin').
 * Responds with 403 Forbidden if the user does not have the required role.
 */
export const requireRole = (role) => (req, res, next) => {
  if (!req.user || !req.user.roles?.includes(role)) {
    return res.status(403).json({ error: 'Forbidden: admin only' });
  }
  next();
};
