/**
 * ============================================
 * STRUCTURED LOGGER
 * ============================================
 * Zero-dependency, JSON-line structured logger.
 * Outputs machine-parseable lines that work with
 * CloudWatch / Datadog / ELK without extra config.
 *
 * Features:
 *  - Level hierarchy: debug → info → warn → error → fatal
 *  - Child loggers with bound context (e.g. correlationId)
 *  - Automatic timestamp in ISO-8601
 *  - Respects LOG_LEVEL env var
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('Server started', { port: 3000 });
 *
 *   const log = logger.child({ correlationId: 'abc-123' });
 *   log.warn('Slow query', { durationMs: 520 });
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

function getMinLevel(): LogLevel {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env && env in LEVEL_ORDER) return env as LogLevel;
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  [key: string]: unknown;
}

class Logger {
  private context: Record<string, unknown>;

  constructor(context: Record<string, unknown> = {}) {
    this.context = context;
  }

  /**
   * Create a child logger with additional bound context.
   * Context is shallow-merged; child values override parent.
   */
  child(ctx: Record<string, unknown>): Logger {
    return new Logger({ ...this.context, ...ctx });
  }

  /**
   * Create a request-scoped logger with correlationId, path, and method.
   * Convenience for API routes.
   */
  forRequest(requestId: string, path: string, method: string, userId?: string): Logger {
    return this.child({
      requestId,
      path,
      method,
      ...(userId ? { userId } : {}),
    });
  }

  /**
   * Create a trade-scoped logger with coin + order context.
   * Always use for trading-related logs.
   */
  forTrade(coinSymbol: string, orderSide: 'buy' | 'sell', userId?: string): Logger {
    return this.child({
      module: 'trade',
      coinSymbol,
      orderSide,
      ...(userId ? { userId } : {}),
    });
  }

  /**
   * Create a crypto API-scoped logger.
   */
  forApi(provider: string, endpoint?: string): Logger {
    return this.child({
      module: 'external-api',
      provider,
      ...(endpoint ? { endpoint } : {}),
    });
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>) {
    this.log('error', message, data);
  }

  fatal(message: string, data?: Record<string, unknown>) {
    this.log('fatal', message, data);
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    const minLevel = getMinLevel();
    if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return;

    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      ...this.context,
      ...data,
    };

    const line = JSON.stringify(entry);

    // Use appropriate console method so log aggregators can pick up severity
    switch (level) {
      case 'debug':
        console.debug(line);
        break;
      case 'info':
        console.info(line);
        break;
      case 'warn':
        console.warn(line);
        break;
      case 'error':
      case 'fatal':
        console.error(line);
        break;
    }
  }
}

/** Singleton root logger */
export const logger = new Logger();
