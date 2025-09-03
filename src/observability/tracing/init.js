// This file must be imported FIRST, before any other modules
// OpenTelemetry auto-instrumentation needs to be loaded before the application code

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// Check if tracing should be enabled
const environment = process.env.NODE_ENV || 'development';
const enableTracing = process.env.ENABLE_TRACING !== 'false' && environment !== 'test';

// SDK instance
let sdk = null;

/**
 * Initialize OpenTelemetry tracing for the service
 * This must be called before any other application code
 */
function initializeTracing() {
  if (!enableTracing) {
    console.log('Tracing disabled for admin-service environment:', environment);
    return false;
  }

  if (sdk) {
    console.log('OpenTelemetry tracing already initialized for admin-service');
    return true; // Already initialized
  }

  console.log('Initializing OpenTelemetry tracing for admin-service...');

  try {
    sdk = new NodeSDK({
      traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
        headers: {},
      }),
      serviceName: process.env.SERVICE_NAME || process.env.OTEL_SERVICE_NAME || 'admin-service',
      serviceVersion: process.env.SERVICE_VERSION || process.env.OTEL_SERVICE_VERSION || '1.0.0',
      instrumentations: [
        getNodeAutoInstrumentations({
          // Disable file system instrumentation that can be noisy
          '@opentelemetry/instrumentation-fs': {
            enabled: false,
          },
        }),
      ],
    });

    sdk.start();
    console.log('✅ OpenTelemetry tracing initialized successfully for admin-service');

    // Graceful shutdown
    process.on('SIGTERM', () => {
      shutdownTracing()
        .then(() => process.exit(0))
        .catch((error) => {
          console.error('Error during graceful shutdown:', error);
          process.exit(1);
        });
    });

    return true;
  } catch (error) {
    console.warn('⚠️ Failed to initialize OpenTelemetry for admin-service:', error.message);
    return false;
  }
}

/**
 * Shutdown OpenTelemetry SDK
 * @returns {Promise<void>}
 */
function shutdownTracing() {
  if (sdk) {
    return sdk
      .shutdown()
      .then(() => console.log('Admin service tracing terminated'))
      .catch((error) => console.error('Error terminating admin service tracing', error));
  }
  return Promise.resolve();
}

/**
 * Check if tracing is enabled
 * @returns {boolean} - True if tracing is enabled
 */
function isTracingEnabled() {
  return enableTracing && !!sdk;
}

// Auto-initialize when this module is imported (for backward compatibility)
initializeTracing();

// Export functions for manual control if needed
export { initializeTracing, shutdownTracing, isTracingEnabled };
