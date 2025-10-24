export function getWelcomeMessage(req, res) {
  res.json({
    message: 'Welcome to the Admin Service',
    service: 'admin-service',
    description: 'Administrative management service for AIOutlet platform',
  });
}

export function getVersion(req, res) {
  res.json({
    version: process.env.API_VERSION || '1.0.0',
    service: 'admin-service',
    environment: process.env.NODE_ENV || 'development',
  });
}
