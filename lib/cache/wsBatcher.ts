/**
 * ============================================
 * WEBSOCKET MESSAGE BATCHER + BACKPRESSURE
 * ============================================
 * Batches rapid WebSocket messages and handles backpressure.
 *
 * Problem without batching:
 *   BTC price updates 10x/second → 10 React re-renders/second → UI jank
 *
 * Solution:
 *   1. Collect messages in a buffer
 *   2. Flush buffer on interval (e.g. every 250ms)
 *   3. Merge duplicate keys (only latest price matters)
 *   4. Backpressure: if buffer overflows, drop oldest messages
 *
 * Result:
 *   10 updates/second → 4 batched updates/second → smooth 60fps UI
 *
 * Same pattern: Trading platforms (Binance, TradingView), game engines
 *
 * Usage:
 *   const batcher = new WebSocketBatcher<PriceUpdate>({
 *     flushIntervalMs: 250,
 *     maxBufferSize: 100,
 *     mergeKey: (msg) => msg.symbol,     // merge by coin symbol
 *     onFlush: (batch) => updateState(batch),
 *   });
 *
 *   ws.onmessage = (event) => batcher.push(JSON.parse(event.data));
 */

export interface BatcherOptions<T> {
  /** How often to flush (ms). Lower = more responsive, higher = fewer renders */
  flushIntervalMs: number;
  /** Max messages in buffer before backpressure kicks in */
  maxBufferSize: number;
  /** Extract a unique key for deduplication/merge. If not set, all messages kept */
  mergeKey?: (message: T) => string;
  /** Called with the batched messages on each flush */
  onFlush: (messages: T[]) => void;
  /** Called when buffer overflows (monitoring) */
  onBackpressure?: (dropped: number) => void;
}

export class WebSocketBatcher<T> {
  private buffer: Map<string, T> = new Map();
  private rawBuffer: T[] = [];
  private interval: ReturnType<typeof setInterval> | null = null;
  private options: BatcherOptions<T>;
  private totalReceived = 0;
  private totalFlushed = 0;
  private totalDropped = 0;

  constructor(options: BatcherOptions<T>) {
    this.options = options;
  }

  /**
   * Start the batching interval.
   */
  start(): void {
    if (this.interval) return;
    this.interval = setInterval(() => this.flush(), this.options.flushIntervalMs);
  }

  /**
   * Stop the batcher and flush remaining messages.
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.flush(); // flush remaining
  }

  /**
   * Push a message into the buffer.
   * If mergeKey is defined, newer messages overwrite older ones with same key.
   */
  push(message: T): void {
    this.totalReceived++;

    if (this.options.mergeKey) {
      const key = this.options.mergeKey(message);

      // Backpressure: if buffer exceeds max, drop oldest entries
      if (this.buffer.size >= this.options.maxBufferSize) {
        const firstKey = this.buffer.keys().next().value;
        if (firstKey !== undefined) {
          this.buffer.delete(firstKey);
          this.totalDropped++;
          this.options.onBackpressure?.(1);
        }
      }

      // Set/overwrite (only latest value for each key matters)
      this.buffer.set(key, message);
    } else {
      // No merge key: simple array buffer with overflow protection
      if (this.rawBuffer.length >= this.options.maxBufferSize) {
        const dropped = this.rawBuffer.splice(0, Math.floor(this.options.maxBufferSize / 4));
        this.totalDropped += dropped.length;
        this.options.onBackpressure?.(dropped.length);
      }
      this.rawBuffer.push(message);
    }
  }

  /**
   * Flush the buffer: collect all messages, clear buffer, call onFlush.
   */
  private flush(): void {
    let messages: T[];

    if (this.options.mergeKey) {
      if (this.buffer.size === 0) return;
      messages = Array.from(this.buffer.values());
      this.buffer.clear();
    } else {
      if (this.rawBuffer.length === 0) return;
      messages = [...this.rawBuffer];
      this.rawBuffer.length = 0;
    }

    this.totalFlushed += messages.length;
    this.options.onFlush(messages);
  }

  /**
   * Get performance stats for monitoring.
   */
  getStats() {
    return {
      totalReceived: this.totalReceived,
      totalFlushed: this.totalFlushed,
      totalDropped: this.totalDropped,
      currentBufferSize: this.options.mergeKey ? this.buffer.size : this.rawBuffer.length,
      compressionRatio:
        this.totalReceived > 0
          ? ((1 - this.totalFlushed / this.totalReceived) * 100).toFixed(1) + '%'
          : 'N/A',
      isRunning: this.interval !== null,
    };
  }

  /**
   * Reset stats (for testing/monitoring).
   */
  resetStats(): void {
    this.totalReceived = 0;
    this.totalFlushed = 0;
    this.totalDropped = 0;
  }
}
