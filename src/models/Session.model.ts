import mongoose, { Schema, Document, Model } from 'mongoose';

/* ── Interfaces ───────────────────────────────────────────── */

export interface ISession {
  userId: mongoose.Types.ObjectId;
  sessionId: string; // unique — from JWT jti claim
  deviceInfo: string;
  ip: string;
  userAgent: string;
  expiresAt: Date;
  lastActiveAt: Date;
  revoked: boolean;
  createdAt: Date;
}

/**
 * Session model is for **audit/UI** only (active sessions page).
 * Authentication is stateless JWT — no DB lookup per request.
 * Session revocation adds sessionId to a Redis blocklist (checked in middleware).
 */
export interface ISessionDocument extends ISession, Document {
  _id: mongoose.Types.ObjectId;
}

export type ISessionModel = Model<ISessionDocument>;

/* ── Schema ───────────────────────────────────────────────── */

const sessionSchema = new Schema<ISessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true },
    deviceInfo: { type: String, default: 'unknown' },
    ip: { type: String, required: true },
    userAgent: { type: String, default: '' },
    expiresAt: { type: Date, required: true },
    lastActiveAt: { type: Date, default: Date.now },
    revoked: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

/* ── Indexes ──────────────────────────────────────────────── */

// Fast session lookup by ID
sessionSchema.index({ sessionId: 1 }, { unique: true });

// User's active sessions (for "active sessions" UI page)
sessionSchema.index({ userId: 1, revoked: 1 });

// Auto-delete expired sessions (TTL index)
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/* ── Export ────────────────────────────────────────────────── */

const Session: ISessionModel =
  (mongoose.models.Session as ISessionModel) ||
  mongoose.model<ISessionDocument>('Session', sessionSchema);

export default Session;
