import ErrorResponse from '../../src/utils/error.response.js';

describe('ErrorResponse', () => {
  it('should create error with message and status code', () => {
    const message = 'Test error';
    const statusCode = 400;

    const error = new ErrorResponse(message, statusCode);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
  });

  it('should create error with different status codes', () => {
    const error404 = new ErrorResponse('Not found', 404);
    expect(error404.statusCode).toBe(404);

    const error500 = new ErrorResponse('Server error', 500);
    expect(error500.statusCode).toBe(500);

    const error401 = new ErrorResponse('Unauthorized', 401);
    expect(error401.statusCode).toBe(401);
  });

  it('should have stack trace', () => {
    const error = new ErrorResponse('Test error', 400);

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('Test error');
  });
});
