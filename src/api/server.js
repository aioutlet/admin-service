import dotenv from 'dotenv';
dotenv.config({ quiet: true });

// Industry-standard initialization pattern:
// 1. Load environment variables
// 2. Initialize observability modules (logger, tracing) - uses console.log for bootstrap
// 3. Start application

import '../shared/observability/logging/logger.js';
import '../shared/observability/tracing/init.js';

await import('./app.js');
