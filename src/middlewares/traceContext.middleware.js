/**
 * Trace Context Middleware
 * Extracts W3C Trace Context from Dapr's traceparent header
 * 
 * Dapr automatically injects the traceparent header following W3C Trace Context format:
 * traceparent: version-traceId-spanId-flags
 * Example: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
 * 
 * This middleware extracts the traceId and spanId for use in logging and event correlation.
 */
const traceContextMiddleware = (req, res, next) => {
  const traceparent = req.headers.traceparent;

  if (traceparent) {
    // Parse W3C traceparent format: version-traceId-spanId-flags
    const parts = traceparent.split('-');
    if (parts.length === 4) {
      const traceId = parts[1]; // 32-character hex string
      const spanId = parts[2]; // 16-character hex string

      // Store in res.locals for use in controllers and middleware
      res.locals.traceId = traceId;
      res.locals.spanId = spanId;

      // Also set in req for backward compatibility if needed
      req.traceId = traceId;
      req.spanId = spanId;
    } else {
      console.warn('Invalid traceparent format:', traceparent);
    }
  } else {
    // No traceparent header - set defaults for development without Dapr
    res.locals.traceId = 'no-trace';
    res.locals.spanId = 'no-span';
    req.traceId = 'no-trace';
    req.spanId = 'no-span';
  }

  next();
};

export default traceContextMiddleware;
