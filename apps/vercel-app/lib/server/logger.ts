/**
 * SIERRA ESTATES — STRUCTURED LOGGER (Pino)
 *
 * Replaces raw console.log/warn/error with leveled, structured logging.
 * - In development: pretty-printed to stdout
 * - In production: JSON output for log aggregation
 *
 * Usage:
 *   import { logger } from '@/lib/server/logger';
 *   logger.info({ leadId }, 'Lead created');
 *   logger.warn({ err }, 'Rate limit approaching');
 *   logger.error({ err, route }, 'API handler failed');
 */

import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

const transport = isDev
  ? {
      target: 'pino/file',
      options: { destination: 1 }, // stdout
    }
  : undefined;

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  name: 'sierra-estates',
  ...(transport ? { transport } : {}),
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
  // Redact sensitive fields automatically
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.privateKey',
      '*.apiKey',
      '*.token',
      '*.secret',
      '*.FIREBASE_PRIVATE_KEY',
      '*.FIREBASE_SERVICE_ACCOUNT_JSON',
    ],
    censor: '[REDACTED]',
  },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

/**
 * Create a child logger for a specific module/context.
 * Usage: const log = createLogger('api:leads');
 */
export function createLogger(module: string) {
  return logger.child({ module });
}

export default logger;
