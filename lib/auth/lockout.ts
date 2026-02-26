/**
 * Account lockout after repeated failed logins.
 * Tracks per-email failed attempts in MongoDB.
 *
 * Policy:
 *   5 fails  → 15 min lock
 *  10 fails  →  1 hour lock
 *  20+ fails → 24 hour lock
 */
import dbConnect from '@/lib/dbConnect';
import mongoose, { Schema, Document } from 'mongoose';

interface ILoginAttempt extends Document {
  email: string;
  failedCount: number;
  lastFailedAt: Date;
  lockedUntil: Date | null;
}

const loginAttemptSchema = new Schema<ILoginAttempt>({
  email: { type: String, required: true, unique: true, lowercase: true },
  failedCount: { type: Number, default: 0 },
  lastFailedAt: { type: Date, default: null },
  lockedUntil: { type: Date, default: null },
});

const LoginAttempt =
  mongoose.models.LoginAttempt ||
  mongoose.model<ILoginAttempt>('LoginAttempt', loginAttemptSchema);

function getLockDuration(failedCount: number): number {
  if (failedCount >= 20) return 24 * 60 * 60 * 1000;  // 24h
  if (failedCount >= 10) return 60 * 60 * 1000;        // 1h
  if (failedCount >= 5) return 15 * 60 * 1000;         // 15min
  return 0;
}

/**
 * Check if the account is currently locked.
 */
export async function isAccountLocked(email: string): Promise<{ locked: boolean; retryAfter?: number }> {
  await dbConnect();
  const record = await LoginAttempt.findOne({ email: email.toLowerCase() });

  if (!record || !record.lockedUntil) return { locked: false };

  const now = Date.now();
  if (now < record.lockedUntil.getTime()) {
    return {
      locked: true,
      retryAfter: Math.ceil((record.lockedUntil.getTime() - now) / 1000),
    };
  }

  // Lock expired — reset
  record.failedCount = 0;
  record.lockedUntil = null;
  await record.save();
  return { locked: false };
}

/**
 * Record a failed login attempt and apply lockout if threshold exceeded.
 */
export async function recordFailedLogin(email: string): Promise<void> {
  await dbConnect();
  const record = await LoginAttempt.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $inc: { failedCount: 1 },
      $set: { lastFailedAt: new Date() },
    },
    { upsert: true, new: true },
  );

  const lockMs = getLockDuration(record.failedCount);
  if (lockMs > 0) {
    record.lockedUntil = new Date(Date.now() + lockMs);
    await record.save();
  }
}

/**
 * Reset failed attempts on successful login.
 */
export async function resetLoginAttempts(email: string): Promise<void> {
  await dbConnect();
  await LoginAttempt.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { failedCount: 0, lockedUntil: null } },
  );
}

export { LoginAttempt };
