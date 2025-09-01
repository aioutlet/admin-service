/**
 * Admin Service Configuration
 */

/**
 * Configuration object
 */
const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Server
  server: {
    port: parseInt(process.env.PORT, 10) || 3008,
    host: process.env.HOST || '0.0.0.0',
  },

  // Database
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // External Services
  services: {
    user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
    audit: process.env.AUDIT_SERVICE_URL || 'http://localhost:3007',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003',
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    corsOrigin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : ['http://localhost:3000'],
    enableSecurityHeaders: process.env.ENABLE_SECURITY_HEADERS === 'true',
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
  },

  // Admin specific settings
  admin: {
    sessionTimeout: parseInt(process.env.ADMIN_SESSION_TIMEOUT, 10) || 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: parseInt(process.env.ADMIN_MAX_LOGIN_ATTEMPTS, 10) || 5,
    lockoutDuration: parseInt(process.env.ADMIN_LOCKOUT_DURATION, 10) || 15 * 60 * 1000, // 15 minutes
  },
};

export default config;
