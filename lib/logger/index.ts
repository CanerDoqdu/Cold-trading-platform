/**
 * ============================================
 * STRUCTURED LOGGER
 * ============================================
 * JSON-structured logging with levels, correlation ID, and context.
 *
 * Why structured logging?
 *  - Parseable by any log aggregator (Datadog, Grafana, ELK, CloudWatch)
 *  - Filterable by level, correlationId, category
 *  - Replaces scattered console.log that tells you nothing in production
 *
 * Log Levels (ascending severity):
 *   debug → info → warn → error → fatal
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *
 *   logger.info('User logged in', { userId: '123', method: 'email' });
 *   logger.error('DB connection failed', { host: 'mongo', retries: 3 });
 *   logger.warn('Rate limit approaching', { ip: '1.2.3.4', remaining: 5 });
 *
 * With correlation ID:
 *   const log = logger.child({ correlationId: 'abc-123' });
 *   log.info('Processing request');     // correlationId auto-attached
 *   log.error('Failed to process');     // same correlationId
 *
 * Same approach: Pino, Winston in production, Stripe's internal logger
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  correlationId?: string;
  service: string;
}

interface LoggerOptions {
  level?: LogLevel;
  service?: string;
  defaultContext?: Record<string, any>;
}

class Logger {
  private level: LogLevel;
  private service: string;
  private defaultContext: Record<string, any>;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.service = options.service || 'crypto-app';
    this.defaultContext = options.defaultContext || {};
  }

  /**
   * Create a child logger with additional default context.
   * Useful for adding correlationId to all logs in a request.
   */
  child(context: Record<string, any>): Logger {
    return new Logger({
      level: this.level,
      service: this.service,
      defaultContext: { ...this.defaultContext, ...context },
    });
  }

  /**
   * Core log method. Checks level, builds structured entry, outputs.
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // Skip if below configured level
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.level]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      ...(Object.keys(this.defaultContext).length > 0 || context
        ? { context: { ...this.defaultContext, ...context } }
        : {}),
    };

    // Extract correlationId to top level if present in context
    const mergedContext = { ...this.defaultContext, ...context };
    if (mergedContext.correlationId) {
      entry.correlationId = mergedContext.correlationId;
    }

    this.output(level, entry);
  }

  /**
   * Output the log entry.
   * In production: JSON to stdout (for log aggregators).
   * In development: pretty-printed for readability.
   */
  private output(level: LogLevel, entry: LogEntry): void {
    const json = JSON.stringify(entry);

    switch (level) {
      case 'debug':
        console.debug(json);
        break;
      case 'info':
        console.info(json);
        break;
      case 'warn':
        console.warn(json);
        break;
      case 'error':
      case 'fatal':
        console.error(json);
        break;
    }
  }

  // ─── Public API ───

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  fatal(message: string, context?: Record<string, any>): void {
    this.log('fatal', message, context);
  }

  /**
   * Log a request start (call at handler entry).
   */
  request(method: string, path: string, correlationId: string, extra?: Record<string, any>): void {
    this.info('Incoming request', {
      correlationId,
      method,
      path,
      ...extra,
    });
  }

  /**
   * Log a request completion (call before response).
   */
  response(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    correlationId: string,
  ): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.log(level, 'Request completed', {
      correlationId,
      method,
      path,
      statusCode,
      durationMs,
    });
  }
}

/**
 * Singleton logger instance.
 * import { logger } from '@/lib/logger';
 */
export const logger = new Logger();

export { Logger };
