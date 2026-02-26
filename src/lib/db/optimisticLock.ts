/**
 * Custom error thrown when an optimistic locking conflict is detected.
 * The document was modified by another request between read and write.
 */
export class ConcurrencyError extends Error {
  constructor(message = 'Document was modified by another request') {
    super(message);
    this.name = 'ConcurrencyError';
  }
}

/**
 * Optimistic locking helper using Mongoose `__v` version key.
 *
 * When `optimisticConcurrency: true` is set on a schema, Mongoose
 * automatically checks `__v` on `save()`. This helper provides the
 * same guarantee for `findOneAndUpdate` operations.
 *
 * @example
 * ```ts
 * import Portfolio from '@/models/Portfolio.model';
 * import { optimisticUpdate } from '@/lib/db/optimisticLock';
 *
 * const updated = await optimisticUpdate(Portfolio, {
 *   filter: { userId, 'holdings.coinId': coinId },
 *   currentVersion: holding.__v,
 *   update: { $set: { 'holdings.$.amount': newAmount } },
 * });
 * ```
 */
export async function optimisticUpdate<T>(
  model: { findOneAndUpdate: (...args: unknown[]) => unknown },
  opts: {
    filter: Record<string, unknown>;
    currentVersion: number;
    update: Record<string, unknown>;
  },
): Promise<T> {
  const result = await (model.findOneAndUpdate as Function)(
    { ...opts.filter, __v: opts.currentVersion },
    { ...opts.update, $inc: { __v: 1 } },
    { new: true },
  );

  if (!result) {
    throw new ConcurrencyError();
  }

  return result as T;
}
