import mongoose, { Document, Schema } from 'mongoose';

/**
 * Soft-delete plugin for Mongoose schemas.
 *
 * Adds a `deletedAt` field and provides:
 * - `softDelete()` instance method — sets `deletedAt` to now
 * - `restore()` instance method — clears `deletedAt`
 * - Default query filter: excludes soft-deleted documents
 * - `findWithDeleted()` static — bypasses soft-delete filter
 *
 * @example
 * ```ts
 * import { applySoftDelete } from '@/lib/db/softDelete';
 *
 * const schema = new Schema({ name: String });
 * applySoftDelete(schema);
 *
 * // Normal find excludes deleted docs:
 * await Model.find({});
 *
 * // Include deleted docs for admin/audit:
 * await Model.find({ deletedAt: { $ne: null } });
 *
 * // Soft-delete a document:
 * await doc.softDelete();
 *
 * // Restore a soft-deleted document:
 * await doc.restore();
 * ```
 */

/* ── Interfaces ───────────────────────────────────────────── */

export interface SoftDeletable {
  deletedAt: Date | null;
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

/* ── Plugin ───────────────────────────────────────────────── */

export function applySoftDelete<T extends Document>(schema: Schema<T>): void {
  // Add deletedAt field if not already present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (schema as any).add({
    deletedAt: { type: Date, default: null },
  });

  // Index for soft-delete filtering
  schema.index({ deletedAt: 1 });

  // Instance method: soft delete
  schema.methods.softDelete = async function (this: T & SoftDeletable) {
    this.deletedAt = new Date();
    return this.save();
  };

  // Instance method: restore
  schema.methods.restore = async function (this: T & SoftDeletable) {
    this.deletedAt = null;
    return this.save();
  };

  // Pre-find hooks: default to excluding soft-deleted documents
  const queryHooks = ['find', 'findOne', 'findOneAndUpdate', 'countDocuments'] as const;

  for (const hook of queryHooks) {
    schema.pre(hook, function (this: mongoose.Query<unknown, T>, next) {
      const filter = this.getFilter();
      // Only apply auto-filter if caller didn't explicitly include deletedAt
      if (filter.deletedAt === undefined && filter._includeDeleted !== true) {
        this.where({ deletedAt: null });
      }
      next();
    });
  }
}

/**
 * Hard-delete soft-deleted documents older than the specified number of days.
 * For GDPR compliance — run via admin script.
 *
 * @param model Mongoose model with soft-delete support
 * @param days Number of days after soft-delete to hard-delete (default: 90)
 */
export async function purgeDeleted(
  model: mongoose.Model<Document>,
  days = 90,
): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const result = await model.deleteMany({
    deletedAt: { $ne: null, $lt: cutoff },
  });

  return result.deletedCount ?? 0;
}
