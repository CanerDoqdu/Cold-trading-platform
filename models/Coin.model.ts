import mongoose, { Schema, Document, Model } from 'mongoose';

/* ── Interfaces ───────────────────────────────────────────── */

export interface ICoin {
  symbol: string;
  name: string;
  description?: string;
  price: number;
  marketCap: number;
  changePercentage: number;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICoinDocument extends ICoin, Document {
  _id: mongoose.Types.ObjectId;
}

export type ICoinModel = Model<ICoinDocument>;

/* ── Schema ───────────────────────────────────────────────── */

const coinSchema = new Schema<ICoinDocument>(
  {
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    marketCap: { type: Number, required: true },
    changePercentage: { type: Number, required: true },
    image: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

/* ── Indexes ──────────────────────────────────────────────── */

// Unique symbol lookup
coinSchema.index({ symbol: 1 }, { unique: true });

// Full-text search on name + symbol (Atlas Search preferred, this is fallback)
coinSchema.index({ name: 'text', symbol: 'text' });

// Market cap ranking
coinSchema.index({ marketCap: -1 });

/* ── Export ────────────────────────────────────────────────── */

const Coin: ICoinModel =
  (mongoose.models.Coin as ICoinModel) ||
  mongoose.model<ICoinDocument>('Coin', coinSchema);

export default Coin;
