import { z } from 'zod';

export const watchlistInputSchema = z.object({
  brand: z.string().trim().min(1, 'Brand is required.'),
  model: z.string().trim().min(1, 'Shoe title is required.'),
  name: z.string().trim().optional().nullable(),
  colorway: z.string().trim().optional().nullable(),
  sku: z.string().trim().optional().nullable(),
  size: z.string().trim().optional().nullable(),
  targetPrice: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === null || value === undefined || value === '') return null;
      const numeric = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(numeric) ? numeric : null;
    }),
  alertType: z.enum(['release', 'restock', 'price_drop', 'any']),
  isActive: z.boolean().optional().default(true),
});

export type WatchlistInput = z.infer<typeof watchlistInputSchema>;
