import { info, version } from '../../src/controllers/home.controller.js';

describe('home.controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.API_VERSION;
  });

  describe('info', () => {
    it('should return service information with test environment', () => {
      info(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Welcome to the Admin Service',
        service: 'admin-service',
        description: 'Administrative management service for AIOutlet platform',
        environment: 'test',
      });
    });

    it('should return service information with production environment', () => {
      process.env.NODE_ENV = 'production';

      info(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Welcome to the Admin Service',
        service: 'admin-service',
        description: 'Administrative management service for AIOutlet platform',
        environment: 'production',
      });
    });
  });

  describe('version', () => {
    it('should return default version when API_VERSION is not set', () => {
      version(req, res);

      expect(res.json).toHaveBeenCalledWith({
        version: '1.0.0',
      });
    });

    it('should return custom version when API_VERSION is set', () => {
      process.env.API_VERSION = '2.0.0';

      version(req, res);

      expect(res.json).toHaveBeenCalledWith({
        version: '2.0.0',
      });
    });
  });
});
