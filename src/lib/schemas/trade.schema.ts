import { z } from 'zod';

/** Positive finite number — rejects NaN, Infinity, negatives, zero */
const positiveFinite = z
  .number()
  .positive('Must be a positive number')
  .finite('Must be a finite number');

/** Up to 8 decimal places (crypto standard) */
const cryptoAmount = positiveFinite.refine((v) => {
  const parts = v.toString().split('.');
  return !parts[1] || parts[1].length <= 8;
}, 'Supports up to 8 decimal places');

/** Up to 8 decimal places for price */
const cryptoPrice = positiveFinite.refine((v) => {
  const parts = v.toString().split('.');
  return !parts[1] || parts[1].length <= 8;
}, 'Supports up to 8 decimal places');

// ── Place order ────────────────────────
export const orderSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .max(20)
    .regex(/^[A-Za-z0-9-]+$/, 'Invalid symbol format')
    .toUpperCase(),
  coinId: z.string().min(1).max(100),
  coinName: z.string().min(1).max(100),
  side: z.enum(['buy', 'sell'], { message: 'Side must be "buy" or "sell"' }),
  amount: cryptoAmount,
  clientPrice: cryptoPrice,
  type: z.enum(['market', 'limit']).default('market'),
  limitPrice: cryptoPrice.optional(),
  idempotencyKey: z
    .string()
    .uuid('Idempotency key must be a valid UUID'),
});
export type OrderInput = z.infer<typeof orderSchema>;

// ── Cancel order ───────────────────────
export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
