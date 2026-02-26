import mongoose, { Schema, Document, Model } from 'mongoose';

/* ── Interfaces ───────────────────────────────────────────── */

export interface IPriceHistory {
  symbol: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IPriceHistoryDocument extends IPriceHistory, Document {
  _id: mongoose.Types.ObjectId;
}

export type IPriceHistoryModel = Model<IPriceHistoryDocument>;

/* ── Schema ───────────────────────────────────────────────── */

/**
 * Time-series collection for OHLCV candle data.
 * Uses MongoDB 5.0+ time-series feature for automatic bucketing.
 *
 * Retention: 90-day TTL index auto-deletes stale data.
 * For longer history, consider InfluxDB or TimescaleDB at scale.
 */
const priceHistorySchema = new Schema<IPriceHistoryDocument>(
  {
    symbol: { type: String, required: true },
    timestamp: { type: Date, required: true },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    close: { type: Number, required: true },
    volume: { type: Number, required: true, default: 0 },
  },
  {
    // MongoDB 5.0+ time-series collection options (applied on first createCollection)
    timeseries: {
      timeField: 'timestamp',
      metaField: 'symbol',
      granularity: 'minutes',
    },
    // Auto-delete data older than 90 days
    expireAfterSeconds: 90 * 24 * 60 * 60,
  },
);

/* ── Indexes ──────────────────────────────────────────────── */

// Compound for querying candles of a specific coin in time range
priceHistorySchema.index({ symbol: 1, timestamp: -1 });

/* ── Export ────────────────────────────────────────────────── */

const PriceHistory: IPriceHistoryModel =
  (mongoose.models.PriceHistory as IPriceHistoryModel) ||
  mongoose.model<IPriceHistoryDocument>('PriceHistory', priceHistorySchema);

export default PriceHistory;
