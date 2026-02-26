import mongoose, { Schema, Document, Model } from 'mongoose';

/* ── Interfaces ───────────────────────────────────────────── */

export interface IPortfolioSnapshot {
  userId: mongoose.Types.ObjectId;
  date: Date;
  totalValueMinor: string; // total portfolio value in USD cents as string
  holdingBreakdown: Array<{
    coinId: string;
    symbol: string;
    amount: number;
    valueMicroUsd: string; // value in micro-USD as string
  }>;
  createdAt: Date;
}

export interface IPortfolioSnapshotDocument extends IPortfolioSnapshot, Document {
  _id: mongoose.Types.ObjectId;
}

export type IPortfolioSnapshotModel = Model<IPortfolioSnapshotDocument>;

/* ── Schema ───────────────────────────────────────────────── */

const snapshotBreakdownSchema = new Schema(
  {
    coinId: { type: String, required: true },
    symbol: { type: String, required: true },
    amount: { type: Number, required: true },
    valueMicroUsd: { type: String, required: true },
  },
  { _id: false },
);

const portfolioSnapshotSchema = new Schema<IPortfolioSnapshotDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    totalValueMinor: { type: String, required: true },
    holdingBreakdown: [snapshotBreakdownSchema],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

/* ── Indexes ──────────────────────────────────────────────── */

// One snapshot per user per day
portfolioSnapshotSchema.index({ userId: 1, date: -1 }, { unique: true });

// Auto-delete snapshots older than 365 days
portfolioSnapshotSchema.index(
  { date: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 },
);

/* ── Export ────────────────────────────────────────────────── */

const PortfolioSnapshot: IPortfolioSnapshotModel =
  (mongoose.models.PortfolioSnapshot as IPortfolioSnapshotModel) ||
  mongoose.model<IPortfolioSnapshotDocument>('PortfolioSnapshot', portfolioSnapshotSchema);

export default PortfolioSnapshot;
