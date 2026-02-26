import mongoose, { Schema, Document, Model } from 'mongoose';

/* ── Interfaces ───────────────────────────────────────────── */

export type AlertCondition = 'above' | 'below';

export interface IPriceAlert {
  userId: mongoose.Types.ObjectId;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  coinImage?: string | null;
  targetPrice: number;
  condition: AlertCondition;
  priceAtCreation: number;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPriceAlertDocument extends IPriceAlert, Document {
  _id: mongoose.Types.ObjectId;
}

export type IPriceAlertModel = Model<IPriceAlertDocument>;

/* ── Schema ───────────────────────────────────────────────── */

const priceAlertSchema = new Schema<IPriceAlertDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coinId: { type: String, required: true },
    coinSymbol: { type: String, required: true },
    coinName: { type: String, required: true },
    coinImage: { type: String, default: null },
    targetPrice: { type: Number, required: true },
    condition: { type: String, enum: ['above', 'below'], required: true },
    priceAtCreation: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    isTriggered: { type: Boolean, default: false },
    triggeredAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

/* ── Indexes ──────────────────────────────────────────────── */

// User's alerts
priceAlertSchema.index({ userId: 1, coinId: 1 });

// Cron query: untriggered active alerts grouped by coin
priceAlertSchema.index({ isTriggered: 1, coinId: 1 });

// Check for active alerts per coin (used in check-alerts cron)
priceAlertSchema.index({ isActive: 1, coinId: 1 });

/* ── Export ────────────────────────────────────────────────── */

const PriceAlert: IPriceAlertModel =
  (mongoose.models.PriceAlert as IPriceAlertModel) ||
  mongoose.model<IPriceAlertDocument>('PriceAlert', priceAlertSchema);

export default PriceAlert;
