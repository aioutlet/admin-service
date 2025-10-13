/**
 * Event Handler Registry
 * Maps event types to their handler functions
 */

import { handleFraudDetected } from './fraud.handler.js';
import { handleOrderHighValue } from './order.handler.js';
import { handleSupportEscalated } from './support.handler.js';

/**
 * Registry of event handlers
 * Each key is an event type, each value is a handler function
 */
const eventHandlers = {
  'fraud.detected': handleFraudDetected,
  'order.high_value': handleOrderHighValue,
  'support.escalated': handleSupportEscalated,
};

export default eventHandlers;
