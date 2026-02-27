// ============================================================
// Backpressure Handler — Drop oldest when UI can't keep up
// ============================================================
// If the WebSocket pushes messages faster than the UI renders,
// we queue them up to maxQueueSize and drop oldest overflow.
// Alternative mode: sampling — show every Nth tick.
// ============================================================

export interface BackpressureOptions {
  /** Maximum messages in queue before dropping oldest (default: 100) */
  maxQueueSize?: number;
  /** If message rate exceeds this per second, switch to sampling mode (default: 100) */
  samplingThreshold?: number;
  /** In sampling mode, only process every Nth message (default: 10) */
  sampleRate?: number;
  /** Called when messages are dropped */
  onDrop?: (dropped: number) => void;
}

const DEFAULTS: Required<Omit<BackpressureOptions, 'onDrop'>> = {
  maxQueueSize: 100,
  samplingThreshold: 100,
  sampleRate: 10,
};

/**
 * Backpressure handler for high-frequency WebSocket streams.
 * Uses a ring-buffer approach with overflow eviction.
 */
export class BackpressureHandler<T> {
  private readonly queue: T[] = [];
  private readonly opts: Required<Omit<BackpressureOptions, 'onDrop'>>;
  private readonly onDrop?: (dropped: number) => void;

  // Rate tracking
  private messageCount = 0;
  private windowStart = Date.now();
  private sampling = false;
  private sampleCounter = 0;

  constructor(options: BackpressureOptions = {}) {
    this.opts = {
      maxQueueSize: options.maxQueueSize ?? DEFAULTS.maxQueueSize,
      samplingThreshold: options.samplingThreshold ?? DEFAULTS.samplingThreshold,
      sampleRate: options.sampleRate ?? DEFAULTS.sampleRate,
    };
    this.onDrop = options.onDrop;
  }

  /**
   * Push a message. Returns `true` if the message should be processed,
   * `false` if it was dropped (backpressure or sampling).
   */
  push(message: T): boolean {
    this.updateRate();

    // Sampling mode: only accept every Nth message
    if (this.sampling) {
      this.sampleCounter++;
      if (this.sampleCounter % this.opts.sampleRate !== 0) {
        return false;
      }
    }

    // Queue overflow: drop oldest
    if (this.queue.length >= this.opts.maxQueueSize) {
      const dropCount = Math.floor(this.opts.maxQueueSize * 0.1); // Drop 10%
      this.queue.splice(0, dropCount);
      this.onDrop?.(dropCount);
    }

    this.queue.push(message);
    return true;
  }

  /** Drain all queued messages */
  drain(): T[] {
    return this.queue.splice(0);
  }

  /** Drain up to `count` messages */
  drainN(count: number): T[] {
    return this.queue.splice(0, count);
  }

  /** Current queue depth */
  get depth(): number {
    return this.queue.length;
  }

  /** Whether sampling mode is active */
  get isSampling(): boolean {
    return this.sampling;
  }

  /** Current messages-per-second rate */
  get rate(): number {
    const elapsed = (Date.now() - this.windowStart) / 1000;
    return elapsed > 0 ? this.messageCount / elapsed : 0;
  }

  /** Reset rate tracking and queue */
  reset(): void {
    this.queue.length = 0;
    this.messageCount = 0;
    this.windowStart = Date.now();
    this.sampling = false;
    this.sampleCounter = 0;
  }

  // ── Private ───────────────────────────────────────────

  private updateRate(): void {
    this.messageCount++;
    const elapsed = Date.now() - this.windowStart;

    // Reset window every second
    if (elapsed >= 1000) {
      const ratePerSec = this.messageCount / (elapsed / 1000);
      this.sampling = ratePerSec > this.opts.samplingThreshold;
      this.messageCount = 0;
      this.windowStart = Date.now();
    }
  }
}
