import mongoose, { Schema, Document, Model } from 'mongoose';

/* ── Interfaces ───────────────────────────────────────────── */

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'pending' | 'filled' | 'cancelled';

export interface IOrder {
  userId: mongoose.Types.ObjectId;
  symbol: string; // e.g. "BTC/USDT"
  side: OrderSide;
  type: OrderType;
  amountAtomic: string; // integer smallest unit as string — avoids float precision
  priceMicroUsd: string; // integer micro-USD as string
  totalMinor: string; // integer USD minor units as string (cents)
  status: OrderStatus;
  idempotencyKey: string; // UUID — unique index prevents duplicate submissions
  slippageBps?: number; // basis points slippage vs requested price
  filledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderDocument extends IOrder, Document {
  _id: mongoose.Types.ObjectId;
}

export type IOrderModel = Model<IOrderDocument>;

/* ── Schema ───────────────────────────────────────────────── */

const orderSchema = new Schema<IOrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true },
    side: { type: String, enum: ['buy', 'sell'], required: true },
    type: { type: String, enum: ['market', 'limit'], required: true },
    amountAtomic: { type: String, required: true },
    priceMicroUsd: { type: String, required: true },
    totalMinor: { type: String, required: true },
    status: { type: String, enum: ['pending', 'filled', 'cancelled'], default: 'pending' },
    idempotencyKey: { type: String, required: true },
    slippageBps: { type: Number, default: undefined },
    filledAt: { type: Date, default: undefined },
  },
  {
    timestamps: true,
  },
);

/* ── Indexes ──────────────────────────────────────────────── */

// User's recent orders (covers "my orders" query)
orderSchema.index({ userId: 1, createdAt: -1 });

// Prevent duplicate order submissions
orderSchema.index({ idempotencyKey: 1 }, { unique: true });

// Filter by symbol + status (e.g. pending limit orders for a symbol)
orderSchema.index({ symbol: 1, status: 1 });

/* ── Export ────────────────────────────────────────────────── */

const Order: IOrderModel =
  (mongoose.models.Order as IOrderModel) ||
  mongoose.model<IOrderDocument>('Order', orderSchema);

export default Order;
