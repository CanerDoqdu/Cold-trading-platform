import { z } from 'zod';

const positiveFinite = z.number().positive().finite();

export const createAlertSchema = z.object({
  coinId: z.string().min(1).max(100),
  coinSymbol: z.string().min(1).max(20).toUpperCase(),
  coinName: z.string().min(1).max(100).optional(),
  coinImage: z.string().url().optional().or(z.literal('')),
  targetPrice: positiveFinite,
  condition: z.enum(['above', 'below'], {
    message: 'Condition must be "above" or "below"',
  }),
  currentPrice: positiveFinite.optional(),
});
export type CreateAlertInput = z.infer<typeof createAlertSchema>;

export const deleteAlertSchema = z.object({
  id: z.string().min(1, 'Alert ID is required'),
});
export type DeleteAlertInput = z.infer<typeof deleteAlertSchema>;
