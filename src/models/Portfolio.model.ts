import mongoose, { Schema, Document, Model } from 'mongoose';

/* ── Interfaces ───────────────────────────────────────────── */

export interface IHolding {
  coinId: string; // CoinGecko coin ID (e.g. "bitcoin")
  symbol: string; // Coin symbol (e.g. "BTC")
  name: string; // Coin name (e.g. "Bitcoin")
  amount: number; // Amount of coins
  buyPrice: number; // Price per coin when bought
  buyDate: Date;
  notes?: string;
}

export interface IPortfolio {
  userId: mongoose.Types.ObjectId;
  holdings: IHolding[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPortfolioDocument extends IPortfolio, Document {
  _id: mongoose.Types.ObjectId;
}

export type IPortfolioModel = Model<IPortfolioDocument>;

/* ── Sub-schema ───────────────────────────────────────────── */

const holdingSchema = new Schema<IHolding>(
  {
    coinId: { type: String, required: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    buyPrice: { type: Number, required: true },
    buyDate: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  { _id: true },
);

/* ── Schema ───────────────────────────────────────────────── */

const portfolioSchema = new Schema<IPortfolioDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    holdings: [holdingSchema],
  },
  {
    timestamps: true,
  },
);

/* ── Indexes ──────────────────────────────────────────────── */

// Fast lookup by userId (already unique)
portfolioSchema.index({ userId: 1 }, { unique: true });

// Compound index for querying specific coin in a user's portfolio
portfolioSchema.index({ userId: 1, 'holdings.coinId': 1 });

/* ── Export ────────────────────────────────────────────────── */

const Portfolio: IPortfolioModel =
  (mongoose.models.Portfolio as IPortfolioModel) ||
  mongoose.model<IPortfolioDocument>('Portfolio', portfolioSchema);

export default Portfolio;
