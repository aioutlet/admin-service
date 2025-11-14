import asyncHandler from '../../src/middlewares/async.handler.js';

describe('asyncHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  it('should call next with no error for successful async function', async () => {
    const asyncFn = jest.fn().mockResolvedValue(undefined);
    const handler = asyncHandler(asyncFn);

    await handler(req, res, next);

    expect(asyncFn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with error for rejected async function', async () => {
    const error = new Error('Test error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const handler = asyncHandler(asyncFn);

    await handler(req, res, next);

    expect(asyncFn).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should handle non-async functions', async () => {
    const syncFn = jest.fn().mockReturnValue(undefined);
    const handler = asyncHandler(syncFn);

    await handler(req, res, next);

    expect(syncFn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });
});
