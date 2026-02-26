import mongoose, { ClientSession } from 'mongoose';

/**
 * Execute a callback inside a MongoDB transaction.
 * Automatically commits on success and aborts + rolls back on error.
 *
 * ⚠️ Requires MongoDB Atlas M0+ with replica set (free tier supports this).
 *
 * @example
 * ```ts
 * await withTransaction(async (session) => {
 *   await Order.create([{ ...orderData }], { session });
 *   await Portfolio.findOneAndUpdate(filter, update, { session });
 * });
 * ```
 */
export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession();
  session.startTransaction({
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
  });

  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}
