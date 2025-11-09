import express from 'express';
import request from 'supertest';
import homeRoutes from '../../src/routes/home.routes.js';

describe('Home Routes Integration', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/home', homeRoutes);
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.API_VERSION;
  });

  describe('GET /api/home', () => {
    it('should return service information', async () => {
      const response = await request(app).get('/api/home');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Welcome to the Admin Service',
        service: 'admin-service',
        description: 'Administrative management service for AIOutlet platform',
        environment: 'test',
      });
    });

    it('should return production environment when set', async () => {
      process.env.NODE_ENV = 'production';

      const response = await request(app).get('/api/home');

      expect(response.status).toBe(200);
      expect(response.body.environment).toBe('production');
    });
  });

  describe('GET /api/home/version', () => {
    it('should return default version', async () => {
      const response = await request(app).get('/api/home/version');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        version: '1.0.0',
      });
    });

    it('should return custom version when set', async () => {
      process.env.API_VERSION = '2.5.0';

      const response = await request(app).get('/api/home/version');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        version: '2.5.0',
      });
    });
  });
});
