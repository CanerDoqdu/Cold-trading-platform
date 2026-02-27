// ============================================================
// Message Buffer — Queue messages during disconnect
// ============================================================
// When the WebSocket disconnects, we buffer outgoing subscription
// requests and replay them on reconnect. Also buffers a snapshot
// of the last known data per stream for instant hydration.
// ============================================================

export interface BufferOptions {
  /** Maximum buffered items (default: 50) */
  maxSize?: number;
  /** Max age in ms before buffer entries expire (default: 60_000) */
  maxAge?: number;
}

interface BufferedItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Bounded FIFO buffer with time-based expiry.
 * Used for queuing subscription requests during disconnect.
 */
export class MessageBuffer<T> {
  private readonly items: BufferedItem<T>[] = [];
  private readonly maxSize: number;
  private readonly maxAge: number;

  constructor(options: BufferOptions = {}) {
    this.maxSize = options.maxSize ?? 50;
    this.maxAge = options.maxAge ?? 60_000;
  }

  /** Add an item to the buffer. Drops oldest if full. */
  push(data: T): void {
    // Evict expired first
    this.evictExpired();

    if (this.items.length >= this.maxSize) {
      this.items.shift();
    }

    this.items.push({ data, timestamp: Date.now() });
  }

  /** Drain all non-expired items and clear the buffer */
  drain(): T[] {
    this.evictExpired();
    const result = this.items.map((item) => item.data);
    this.items.length = 0;
    return result;
  }

  /** Peek at buffered items without draining */
  peek(): T[] {
    this.evictExpired();
    return this.items.map((item) => item.data);
  }

  get size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items.length = 0;
  }

  private evictExpired(): void {
    const now = Date.now();
    while (this.items.length > 0 && now - this.items[0].timestamp > this.maxAge) {
      this.items.shift();
    }
  }
}

// ── Last-Value Cache ──────────────────────────────────────
// Stores the most recent value per key (e.g., per stream).
// Used to hydrate UI instantly on reconnect with last known data.

export class LastValueCache<T> {
  private readonly cache = new Map<string, { data: T; timestamp: number }>();

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): T | undefined {
    return this.cache.get(key)?.data;
  }

  getWithAge(key: string): { data: T; age: number } | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    return { data: entry.data, age: Date.now() - entry.timestamp };
  }

  getAll(): Map<string, T> {
    const result = new Map<string, T>();
    this.cache.forEach((value, key) => {
      result.set(key, value.data);
    });
    return result;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
