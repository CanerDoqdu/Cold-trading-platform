import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'SIGNUP'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | 'EMAIL_CHANGE'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'EMAIL_VERIFIED'
  | 'ORDER_PLACED'
  | 'ORDER_CANCELLED'
  | 'SESSION_REVOKED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'TOS_ACCEPTED'
  | 'FAVORITE_TOGGLE'
  | 'ALERT_CREATED'
  | 'ALERT_DELETED'
  | 'PORTFOLIO_UPDATED';

export interface IAuditLog extends Document {
  userId: string;
  action: AuditAction;
  ip: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    ip: { type: String, required: true },
    userAgent: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    // Financial compliance: never allow deletes
    strict: true,
  },
);

// Compound index for user activity queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

// TTL is intentionally NOT set — financial audit logs are retained forever

const AuditLog =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
