import { z } from 'zod';

/**
 * Price type enum schema
 */
export const priceTypeSchema = z.enum(['COST', 'SELLING']);

/**
 * Schema for creating a new price history entry
 */
export const createPriceHistorySchema = z.object({
  productId: z.string().cuid('Invalid product ID format'),
  type: priceTypeSchema,
  value: z
    .number()
    .positive('Price value must be positive')
    .max(999999999.99, 'Price value is too large'),
  date: z.string().datetime('Invalid date format').or(z.date()).optional(),
});

/**
 * Schema for price history ID parameter
 */
export const priceHistoryIdSchema = z.object({
  id: z.string().cuid('Invalid price history ID format'),
});

/**
 * Schema for product ID parameter
 */
export const productIdParamSchema = z.object({
  productId: z.string().cuid('Invalid product ID format'),
});

/**
 * Type inference from schemas
 */
export type CreatePriceHistoryInput = z.infer<typeof createPriceHistorySchema>;
export type PriceType = z.infer<typeof priceTypeSchema>;
