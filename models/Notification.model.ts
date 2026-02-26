import mongoose, { Schema, Document, Model } from 'mongoose';

/* ── Interfaces ───────────────────────────────────────────── */

export type NotificationType = 'price_alert' | 'system' | 'news' | 'portfolio';

export interface INotification {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  coinId?: string | null;
  coinSymbol?: string | null;
  targetPrice?: number | null;
  currentPrice?: number | null;
  isRead: boolean;
  link?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationDocument extends INotification, Document {
  _id: mongoose.Types.ObjectId;
}

export type INotificationModel = Model<INotificationDocument>;

/* ── Schema ───────────────────────────────────────────────── */

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['price_alert', 'system', 'news', 'portfolio'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    coinId: { type: String, default: null },
    coinSymbol: { type: String, default: null },
    targetPrice: { type: Number, default: null },
    currentPrice: { type: Number, default: null },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: null },
  },
  {
    timestamps: true,
  },
);

/* ── Indexes ──────────────────────────────────────────────── */

// User's notifications sorted by newest first
notificationSchema.index({ userId: 1, createdAt: -1 });

// Unread count badge
notificationSchema.index({ userId: 1, isRead: 1 });

// Auto-delete notifications older than 90 days
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

/* ── Export ────────────────────────────────────────────────── */

const Notification: INotificationModel =
  (mongoose.models.Notification as INotificationModel) ||
  mongoose.model<INotificationDocument>('Notification', notificationSchema);

export default Notification;
