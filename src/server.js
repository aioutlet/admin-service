// Industry-standard initialization pattern:
// 1. Load environment variables
// 2. Validate configuration (blocking - must pass)
// 3. Initialize observability modules (logger, tracing)
// 4. Check dependency health (non-blocking - log only)
// 5. Start application

import dotenv from 'dotenv';
console.log('Step 1: Loading environment variables...');
dotenv.config({ quiet: true });

import validateConfig from './validators/config.validator.js';
import { checkDependencyHealth, getDependencies } from './utils/dependencyHealthChecker.js';

async function startServer() {
  try {
    // STEP 2: Validate configuration (BLOCKING - must pass)
    console.log('Step 2: Validating configuration...');
    validateConfig();

    // STEP 3: Initialize observability
    console.log('Step 3: Initializing observability...');
    await import('./observability/logging/logger.js');
    await import('./observability/tracing/init.js');

    // STEP 4: Check dependency health (wait for completion)
    console.log('Step 4: Checking dependency health...');
    const dependencies = getDependencies();
    const dependencyCount = Object.keys(dependencies).length;

    if (dependencyCount > 0) {
      console.log(`[DEPS] Found ${dependencyCount} dependencies to check`);
      // Wait for health checks to complete before proceeding
      try {
        await checkDependencyHealth(dependencies);
      } catch (error) {
        console.error(`[DEPS] ⚠️ Dependency health check failed: ${error.message}`);
      }
    } else {
      console.log('[DEPS] 📝 No dependencies configured for health checking');
    }

    // STEP 5: Start the application
    console.log('Step 5: Starting admin service...');
    await import('./app.js');
  } catch (error) {
    console.error('❌ Failed to start admin service:', error.message);
    process.exit(1);
  }
}

startServer();
