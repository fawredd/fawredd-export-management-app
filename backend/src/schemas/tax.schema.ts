import { z } from 'zod';

/**
 * Schema for creating a new tax
 */
export const createTaxSchema = z.object({
  productId: z.string().cuid('Invalid product ID format'),
  name: z.string()
    .min(2, 'Tax name must be at least 2 characters')
    .max(100, 'Tax name must not exceed 100 characters'),
  percentage: z.number()
    .min(0, 'Tax percentage cannot be negative')
    .max(100, 'Tax percentage cannot exceed 100%'),
});

/**
 * Schema for updating a tax
 */
export const updateTaxSchema = createTaxSchema.partial().omit({ productId: true });

/**
 * Schema for tax ID parameter
 */
export const taxIdSchema = z.object({
  id: z.string().cuid('Invalid tax ID format'),
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
export type CreateTaxInput = z.infer<typeof createTaxSchema>;
export type UpdateTaxInput = z.infer<typeof updateTaxSchema>;
