import mongoose, { Schema, Document, Model } from 'mongoose';

/* ── Types ────────────────────────────────────────────────── */

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAIL'
  | 'LOGOUT'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | '2FA_FAIL'
  | 'EMAIL_VERIFIED'
  | 'PASSWORD_CHANGED'
  | 'ORDER_PLACED'
  | 'ORDER_CANCELLED'
  | 'SESSION_REVOKED'
  | 'SESSION_REVOKE_ALL';

/* ── Interfaces ───────────────────────────────────────────── */

export interface IAuditLog {
  userId: mongoose.Types.ObjectId;
  action: AuditAction;
  ip: string;
  userAgent: string;
  metadata: Record<string, unknown>; // order details, old values, etc.
  createdAt: Date;
}

/**
 * AuditLog records are **permanent** — no TTL index.
 * Financial compliance requires full audit trail.
 * Records cannot be deleted via any API endpoint.
 */
export interface IAuditLogDocument extends IAuditLog, Document {
  _id: mongoose.Types.ObjectId;
}

export type IAuditLogModel = Model<IAuditLogDocument>;

/* ── Schema ───────────────────────────────────────────────── */

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: [
        'LOGIN_SUCCESS',
        'LOGIN_FAIL',
        'LOGOUT',
        '2FA_ENABLED',
        '2FA_DISABLED',
        '2FA_FAIL',
        'EMAIL_VERIFIED',
        'PASSWORD_CHANGED',
        'ORDER_PLACED',
        'ORDER_CANCELLED',
        'SESSION_REVOKED',
        'SESSION_REVOKE_ALL',
      ],
      required: true,
    },
    ip: { type: String, required: true },
    userAgent: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

/* ── Indexes ──────────────────────────────────────────────── */

// User audit timeline
auditLogSchema.index({ userId: 1, createdAt: -1 });

// Security queries (e.g. "all failed logins in last 24h")
auditLogSchema.index({ action: 1, createdAt: -1 });

/* ── Export ────────────────────────────────────────────────── */

const AuditLog: IAuditLogModel =
  (mongoose.models.AuditLog as IAuditLogModel) ||
  mongoose.model<IAuditLogDocument>('AuditLog', auditLogSchema);

export default AuditLog;
