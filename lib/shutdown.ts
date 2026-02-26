/**
 * Graceful shutdown instrumentation for Next.js standalone / custom server.
 * Drains connections and cleans up on SIGTERM/SIGINT.
 */

import mongoose from 'mongoose';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'shutdown' });

let shuttingDown = false;

export function isShuttingDown() {
  return shuttingDown;
}

export function registerGracefulShutdown() {
  const handler = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    log.info(`Received ${signal} — starting graceful shutdown`);

    // Close MongoDB pool
    try {
      await mongoose.connection.close();
      log.info('MongoDB connection closed');
    } catch (err) {
      log.error('Error closing MongoDB', { error: (err as Error).message });
    }

    log.info('Shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => handler('SIGTERM'));
  process.on('SIGINT', () => handler('SIGINT'));
}
