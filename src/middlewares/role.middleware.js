import ErrorResponse from '../utils/ErrorResponse.js';

// Middleware to require one or more user roles (e.g., 'admin')
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.some((role) => req.user.roles?.includes(role))) {
      return next(new ErrorResponse('Forbidden: insufficient role', 403));
    }
    next();
  };
}
