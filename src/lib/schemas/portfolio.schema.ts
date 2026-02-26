import { z } from 'zod';

const positiveFinite = z.number().positive().finite();

export const addHoldingSchema = z.object({
  coinId: z.string().min(1).max(100),
  symbol: z.string().min(1).max(20).toUpperCase(),
  name: z.string().min(1).max(100),
  amount: positiveFinite,
  buyPrice: positiveFinite,
  buyDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional().default(''),
});
export type AddHoldingInput = z.infer<typeof addHoldingSchema>;

export const updateHoldingSchema = z.object({
  holdingId: z.string().min(1),
  amount: positiveFinite.optional(),
  buyPrice: positiveFinite.optional(),
  notes: z.string().max(500).optional(),
});
export type UpdateHoldingInput = z.infer<typeof updateHoldingSchema>;

export const deleteHoldingSchema = z.object({
  holdingId: z.string().min(1, 'Holding ID is required'),
});
export type DeleteHoldingInput = z.infer<typeof deleteHoldingSchema>;
