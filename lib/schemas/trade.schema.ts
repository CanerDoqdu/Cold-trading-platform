import { z } from 'zod';

/** Positive finite number — rejects NaN, Infinity, negatives, zero */
const positiveFinite = z
  .number()
  .positive('Must be a positive number')
  .finite('Must be a finite number');

// ── Place order ────────────────────────
export const orderSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .max(20)
    .regex(/^[A-Za-z0-9-]+$/, 'Invalid symbol format')
    .toUpperCase(),
  side: z.enum(['buy', 'sell'], { message: 'Side must be "buy" or "sell"' }),
  amount: positiveFinite.refine((v) => {
    const parts = v.toString().split('.');
    return !parts[1] || parts[1].length <= 8;
  }, 'Amount supports up to 8 decimal places'),
  price: positiveFinite.refine((v) => {
    const parts = v.toString().split('.');
    return !parts[1] || parts[1].length <= 8;
  }, 'Price supports up to 8 decimal places'),
  type: z.enum(['market', 'limit']).default('limit'),
});
export type OrderInput = z.infer<typeof orderSchema>;

// ── Cancel order ───────────────────────
export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
